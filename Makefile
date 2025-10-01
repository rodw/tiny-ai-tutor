# use `make start | stop | status | restart` for daemon-ish process management
# see `make help` for more options


########################################################### CONFIG ##

.DEFAULT_GOAL := help
.SUFFIXES:
.PHONY: help install reinstall build run rerun start restart status logs stop clean clean-more
PKG_FILES = client/package.json client/package-lock.json server/package.json server/package-lock.json
DOCKER_CONTAINER_PREFIX = tiny-ai-tutor

############################################################# HELP ##

help: ## show this help message
	@echo ""
	@echo "\033[1;4mCommon Build Targets:\033[0m"
	@echo ""
	@grep -E '^[a-zA-Z_.-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "\033[1;4mQuick Start:\033[0m"
	@echo ""
	@echo "  1. \033[36mcp .env.example .env\033[0m"
	@echo "  2. Edit \033[36m.env\033[0m to set \033[36mOPENAI_KEY\033[0m."
	@echo "  3. Run \033[36mmake run\033[0m to launch in the foreground"
	@echo "      or \033[36mmake start\033[0m to launch as a daemon."
	@echo "      Both targets will automatically"
	@echo "      install and build as needed."
	@echo "  4. Visit \033[36;4mhttp://localhost:8080\033[0m"
	@echo "     (or the HOST_PORT set in .env)."
	@echo ""

########################################################## INSTALL ##

.installed: $(PKG_FILES) # dummy file for tracking if node_modules is dirty
	cd client && npm ci
	cd server && npm ci
	touch .installed

install: .installed ## install 3rd-party dependencies

reinstall: # builds package-lock files if missing
	cd client && rm -rf package-lock.json && npm install
	cd server && rm -rf package-lock.json && npm install

############################################################ BUILD ##

build: .installed ## generates docker images
	docker compose build

############################################################## RUN ##

run: build ## launch docker containers in foreground
	docker compose up

rerun: stop run # stop then run (fg)

########################################################### DAEMON ##

start: build ## launch docker container as a daemon (bg)
	docker compose up -d
	@echo "\nVisit \033[36;4mhttp://localhost:8080\033[0m (or the HOST_PORT set in .env) to view\n"

restart: stop start ## stop then start (daemon)

status: ## check if docker containers are up
	@running=$$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep $(DOCKER_CONTAINER_PREFIX)); \
	if [ -n "$$running" ]; then \
		echo "$$running"; \
		exit 0; \
	else \
		echo "No docker containers matching '$(DOCKER_CONTAINER_PREFIX)' are running."; \
		echo "Try 'make start' to launch. See 'make help' for more."; \
		exit 1; \
	fi

logs: ## tail docker logs
	docker compose logs -f

stop: ## stop docker containers
	docker compose down


############################################################ CLEAN ##

clean: ## remove generated files
	rm -rf client/dist client/tsconfig.tsbuildinfo client/coverage
	rm -rf server/dist server/tsconfig.tsbuildinfo server/coverage

clean-more: clean # remove even more generated files (re-install required)
	rm -rf client/node_modules client/.vite
	rm -rf server/node_modules server/.vite
	rm -rf .installed


############################################################## eof ##
