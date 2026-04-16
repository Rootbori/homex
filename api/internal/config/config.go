package config

import "os"

type Config struct {
	AppEnv      string
	Port        string
	DatabaseURL string
}

func Load() Config {
	return Config{
		AppEnv:      getenv("APP_ENV", "development"),
		Port:        getenv("PORT", "7772"),
		DatabaseURL: getenv("DATABASE_URL", ""),
	}
}

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
