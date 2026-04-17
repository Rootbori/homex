package config

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	AppEnv         string
	Port           string
	DatabaseURL    string
	MigrationsPath string
}

func Load() Config {
	loadDotEnv()

	return Config{
		AppEnv:         getenv("APP_ENV", "development"),
		Port:           getenv("PORT", "7772"),
		DatabaseURL:    getenv("DATABASE_URL", ""),
		MigrationsPath: getenv("MIGRATIONS_PATH", defaultMigrationsPath()),
	}
}

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}

func loadDotEnv() {
	for _, path := range []string{".env", "api/.env"} {
		if err := loadEnvFile(path); err == nil {
			return
		}
	}
}

func loadEnvFile(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	baseDir := filepath.Dir(path)
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		line = strings.TrimPrefix(line, "export ")

		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}

		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if key == "" {
			continue
		}

		if _, exists := os.LookupEnv(key); exists {
			continue
		}

		if key == "MIGRATIONS_PATH" && value != "" && !filepath.IsAbs(value) {
			value = filepath.Clean(filepath.Join(baseDir, value))
		}

		if err := os.Setenv(key, value); err != nil {
			return err
		}
	}

	return scanner.Err()
}

func defaultMigrationsPath() string {
	for _, path := range []string{"./migrations", "api/migrations"} {
		info, err := os.Stat(path)
		if err == nil && info.IsDir() {
			return path
		}
	}

	return "./migrations"
}
