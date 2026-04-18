package usecase

import (
	"context"

	"github.com/rootbeer/homex/api/internal/domain"
)

type geoUsecase struct {
	geoRepo domain.GeoRepository
}

func NewGeoUsecase(geoRepo domain.GeoRepository) GeoUsecase {
	return &geoUsecase{geoRepo: geoRepo}
}

func (u *geoUsecase) ListProvinces(ctx context.Context) ([]domain.ThaiProvince, error) {
	return u.geoRepo.ListProvinces(ctx)
}

func (u *geoUsecase) ListDistricts(ctx context.Context, provinceID uint) ([]domain.ThaiDistrict, error) {
	return u.geoRepo.ListDistricts(ctx, provinceID)
}

func (u *geoUsecase) ListSubdistricts(ctx context.Context, districtID uint) ([]domain.ThaiSubdistrict, error) {
	return u.geoRepo.ListSubdistricts(ctx, districtID)
}
