# use `make start | stop | status | restart` for daemon-ish process management
# see `make help` for more options

########################################################### CONFIG ##

.DEFAULT_GOAL := help
.SUFFIXES:
.PHONY: help install reinstall .images-built-p build rebuild run rerun start restart status logs stop force clean clean-more

PKG_FILES = client/package.json client/package-lock.json server/package.json server/package-lock.json

DOCKER_CONTAINER_PREFIX = tiny-ai-tutor

SERVER_CONTEXT = server/Dockerfile server/.dockerignore server/package.json server/package-lock.json server/tsconfig.json $(wildcard server/src/*)
CLIENT_CONTEXT = client/Dockerfile client/.dockerignore client/package.json client/package-lock.json client/tsconfig.json client/tsconfig.node.json client/vite.config.ts client/nginx.conf client/index.html $(wildcard client/package*.json) $(wildcard client/public/*) $(wildcard client/src/*)
DOCKER_IMAGES = tiny-ai-tutor_server:latest tiny-ai-tutor_client:latest

############################################################# HELP ##

help: ## show this help message
	@echo ""
	@echo "\033[1;4mCommon Build Targets:\033[0m"
	@echo ""
	@grep -E '^[a-zA-Z_.-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'
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

help.all: ## list ALL build targets in this Makefile
	@echo ""
	@echo "\033[1;4mAll Build Targets in this Makefile:\033[0m"
	@echo ""
	@grep -E '^(%/)?[a-zA-Z_.-]+:.*$$' $(firstword $(MAKEFILE_LIST)) | grep -Ev "^.[A-Z]+:" | awk 'BEGIN {FS = ":.*?# "}; {printf "  \033[36m%-19s\033[0m %s\n", $$1, $$2}'
	@echo ""

########################################################## INSTALL ##

%/package-lock.json: %/package.json # builds package-lock.json when missing
	cd $* && npm install

.installed: $(PKG_FILES) # dummy file for tracking if node_modules is dirty
	cd client && npm ci
	cd server && npm ci
	touch .installed

install: .installed ## install 3rd-party dependencies

reinstall: # remove package-locks and force a clean install
	rm -rf .installed client/package-lock.json server/package-lock.json
	$(MAKE) .installed

############################################################ BUILD ##

.images-built: .installed docker-compose.yml $(SERVER_CONTEXT) $(CLIENT_CONTEXT) # dummy file for tracking if latest docker images are dirty
	docker compose build
	touch .images-built

.images-built-p: # remove .images-built when missing in docker
	@for img in $(DOCKER_IMAGES); do \
		if ! docker image inspect $$img >/dev/null 2>&1 ; then \
			rm -rf .images-built; \
			exit; \
		fi ; \
	done ; \

build: .images-built-p .images-built ## generate docker images

rebuild: # re-generate fresh docker images
	rm -rf .images-built
	docker compose build --no-cache
	touch .images-built

############################################################## RUN ##

run: build ## launch docker containers in foreground
	docker compose up

start: build ## launch docker containers as a daemon
	docker compose up -d
	@echo "\nVisit \033[36;4mhttp://localhost:8080\033[0m (or the HOST_PORT set in .env) to view\n"

stop: ## stop docker containers
	docker compose down

restart: stop start ## stop then start

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

############################################################ CLEAN ##

force: ## remove dummy files used for "manual" freshness checking
	rm -rf .installed .images-built

clean: ## remove generated files
	rm -rf client/dist client/tsconfig.tsbuildinfo client/coverage
	rm -rf server/dist server/tsconfig.tsbuildinfo server/coverage

clean-more: force clean # remove even more generated files (re-install required)
	rm -rf client/node_modules client/.vite
	rm -rf server/node_modules server/.vite

############################################################## eof ##
