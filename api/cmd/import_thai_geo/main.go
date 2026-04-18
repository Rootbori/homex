package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/rootbeer/homex/api/internal/config"
	"github.com/rootbeer/homex/api/internal/database"
	"github.com/rootbeer/homex/api/internal/domain"
	"github.com/rootbeer/homex/api/internal/repository"
)

const (
	provinceSourceURL    = "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province.json"
	districtSourceURL    = "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json"
	subdistrictSourceURL = "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json"
)

type provinceSourceItem struct {
	ID          uint   `json:"id"`
	NameTH      string `json:"name_th"`
	NameEN      string `json:"name_en"`
	GeographyID uint   `json:"geography_id"`
}

type districtSourceItem struct {
	ID         uint   `json:"id"`
	ProvinceID uint   `json:"province_id"`
	NameTH     string `json:"name_th"`
	NameEN     string `json:"name_en"`
}

type subdistrictSourceItem struct {
	ID         uint     `json:"id"`
	DistrictID uint     `json:"district_id"`
	ZipCode    any      `json:"zip_code"`
	NameTH     string   `json:"name_th"`
	NameEN     string   `json:"name_en"`
	Latitude   *float64 `json:"lat"`
	Longitude  *float64 `json:"long"`
}

func main() {
	cfg := config.Load()

	db, err := database.Open(cfg)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	if db == nil {
		log.Fatal("DATABASE_URL is required")
	}

	var provinceItems []provinceSourceItem
	var districtItems []districtSourceItem
	var subdistrictItems []subdistrictSourceItem

	mustFetchJSON(provinceSourceURL, &provinceItems)
	mustFetchJSON(districtSourceURL, &districtItems)
	mustFetchJSON(subdistrictSourceURL, &subdistrictItems)

	provinces := make([]domain.ThaiProvince, 0, len(provinceItems))
	for _, item := range provinceItems {
		provinces = append(provinces, domain.ThaiProvince{
			ID:          item.ID,
			NameTH:      item.NameTH,
			NameEN:      item.NameEN,
			GeographyID: item.GeographyID,
		})
	}

	districts := make([]domain.ThaiDistrict, 0, len(districtItems))
	districtProvinceMap := make(map[uint]uint, len(districtItems))
	for _, item := range districtItems {
		districtProvinceMap[item.ID] = item.ProvinceID
		districts = append(districts, domain.ThaiDistrict{
			ID:         item.ID,
			ProvinceID: item.ProvinceID,
			NameTH:     item.NameTH,
			NameEN:     item.NameEN,
		})
	}

	subdistricts := make([]domain.ThaiSubdistrict, 0, len(subdistrictItems))
	for _, item := range subdistrictItems {
		subdistricts = append(subdistricts, domain.ThaiSubdistrict{
			ID:         item.ID,
			ProvinceID: districtProvinceMap[item.DistrictID],
			DistrictID: item.DistrictID,
			ZipCode:    fmt.Sprint(item.ZipCode),
			NameTH:     item.NameTH,
			NameEN:     item.NameEN,
			Latitude:   item.Latitude,
			Longitude:  item.Longitude,
		})
	}

	geoRepo := repository.NewGeoRepository(db)
	if err := geoRepo.ReplaceThailandGeoData(context.Background(), provinces, districts, subdistricts); err != nil {
		log.Fatalf("import thai geo data: %v", err)
	}

	log.Printf("imported thai geo data: provinces=%d districts=%d subdistricts=%d", len(provinces), len(districts), len(subdistricts))
	log.Printf("source: https://github.com/kongvut/thai-province-data (MIT)")
}

func mustFetchJSON[T any](sourceURL string, dest *T) {
	client := &http.Client{Timeout: 45 * time.Second}

	response, err := client.Get(sourceURL)
	if err != nil {
		log.Fatalf("fetch %s: %v", sourceURL, err)
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		log.Fatalf("fetch %s: unexpected status %s", sourceURL, response.Status)
	}

	if err := json.NewDecoder(response.Body).Decode(dest); err != nil {
		log.Fatalf("decode %s: %v", sourceURL, err)
	}
}
