# Makefile for Hingston HTML Project

# Variables
NODE_VERSION_NVM := "lts/*" # NVM will use the latest LTS version of Node.js
TIDY_CONFIG := tidy_config.txt
HTML_FILES_FIND_CMD := find . -type f \( -name "*.htm" -o -name "*.html" \)

# Phony targets
.PHONY: all install_deps check_deps lint format minify clean_node_modules

all: lint

# ==============================================================================
# Installation Targets
# ==============================================================================

install_deps: install_system_deps install_node_env install_npm_packages
	@echo "All dependencies should now be installed."

install_system_deps:
	@echo ">>> Checking and installing system dependencies (tidy)..."
	@if command -v brew &> /dev/null; then \
		echo "Homebrew found. Installing/upgrading tidy via brew..."; \
		if ! brew list tidy-html5 &> /dev/null || ! command -v tidy &> /dev/null; then \
			brew install tidy-html5; \
		else \
			echo "HTML Tidy (tidy-html5) appears to be installed via brew."; \
		fi; \
	elif command -v apt-get &> /dev/null; then \
		echo "Homebrew not found. Attempting to install tidy via apt-get..."; \
		if ! command -v tidy &> /dev/null; then \
			sudo apt-get update && sudo apt-get install -y tidy; \
		else \
			echo "HTML Tidy is already installed (likely via apt)."; \
		fi; \
	else \
		echo "Warning: Neither brew nor apt-get found. Please install HTML Tidy manually."; \
	fi

install_node_env:
	@echo ">>> Setting up Node.js environment..."
	@if command -v brew &> /dev/null && false; then \
		echo "Homebrew found. Installing Node.js via brew (if not present)..."; \
		if ! brew list node &> /dev/null || ! command -v node &> /dev/null; then \
			brew install node; \
		else \
			echo "Node.js appears to be installed via brew."; \
		fi; \
		echo "Using Node.js from brew: `command -v node` (`node -v`)"; \
	else \
		echo "Using nvm to manage Node.js (recommended for flexibility)."; \
		if ! command -v nvm &> /dev/null; then \
			echo "nvm not found. Installing nvm..."; \
			curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash; \
			echo 'IMPORTANT: Close and reopen your terminal, or run: export NVM_DIR="$$HOME/.nvm" && [ -s "$$NVM_DIR/nvm.sh" ] && \. "$$NVM_DIR/nvm.sh"'; \
			echo 'Then, run "make install_node_env" or "make install_deps" again.'; \
			exit 1; \
		fi; \
		echo "nvm is installed. Sourcing nvm and installing/using Node.js $(NODE_VERSION_NVM)..."; \
		export NVM_DIR="$$HOME/.nvm" && \
		[ -s "$$NVM_DIR/nvm.sh" ] && \. "$$NVM_DIR/nvm.sh" && \
		nvm install $(NODE_VERSION_NVM) && \
		nvm use $(NODE_VERSION_NVM) && \
		nvm alias default $(NODE_VERSION_NVM); \
		echo "Node.js version `node -v` is now active via nvm."; \
	fi

install_npm_packages:
	@echo ">>> Installing/updating local npm packages (prettier, html-minifier)..."
	@SHELL_WITH_NVM_EXEC='export NVM_DIR="$$HOME/.nvm" && [ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh" && exec $$SHELL -c'; \
	if ! command -v node &> /dev/null && ! ( bash -c "$$SHELL_WITH_NVM_EXEC 'command -v node &> /dev/null'" ); then \
		echo "Node.js not found. Please run 'make install_node_env' first."; \
		exit 1; \
	fi; \
	if [ ! -f package.json ]; then \
		echo "No package.json found. Initializing npm project..."; \
		if command -v nvm &> /dev/null; then \
			bash -c "$$SHELL_WITH_NVM_EXEC 'npm init -y'"; \
		else \
			npm init -y; \
		fi; \
	fi; \
	echo "Installing prettier and html-minifier..."; \
	if command -v nvm &> /dev/null; then \
		bash -c "$$SHELL_WITH_NVM_EXEC 'npm install --save-dev prettier html-minifier'"; \
	else \
		npm install --save-dev prettier html-minifier; \
	fi


# ==============================================================================
# Check Dependency Target
# ==============================================================================
check_deps:
	@echo ">>> Checking dependencies..."
	@command -v tidy &> /dev/null || (echo "ERROR: HTML Tidy not found. Please run 'make install_system_deps'" && exit 1)
	@echo "HTML Tidy: Found (`command -v tidy`)"
	@SHELL_WITH_NVM_EXEC='export NVM_DIR="$$HOME/.nvm" && [ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh" && exec $$SHELL -c'; \
	if command -v node &> /dev/null ; then \
		echo "Node.js: Found (`command -v node` - `node -v`)"; \
	elif ( bash -c "$$SHELL_WITH_NVM_EXEC 'command -v node &> /dev/null'" ); then \
		echo "Node.js: Found via nvm (`bash -c "$$SHELL_WITH_NVM_EXEC 'command -v node'"` - `bash -c "$$SHELL_WITH_NVM_EXEC 'node -v'"`)" ; \
	else \
		(echo "ERROR: Node.js not found. Please run 'make install_node_env'" && exit 1); \
	fi
	# Check for npx and packages
	@NPX_CMD_PREFIX=''; \
	if command -v nvm &> /dev/null; then \
		NPX_CMD_PREFIX="export NVM_DIR='$$HOME/.nvm' && [ -s '$$NVM_DIR/nvm.sh' ] && \. '$$NVM_DIR/nvm.sh' && npx"; \
	elif command -v npx &> /dev/null; then \
		NPX_CMD_PREFIX="npx"; \
	else \
		(echo "ERROR: npx command not found. Ensure Node.js/npm is properly installed and in PATH." && exit 1); \
	fi; \
	bash -c "$$NPX_CMD_PREFIX prettier --version &> /dev/null" || (echo "ERROR: Prettier not found (via npx). Please run 'make install_npm_packages'" && exit 1)
	@echo "Prettier: Found (via npx, version `bash -c \"$$NPX_CMD_PREFIX prettier --version\"`)"
	bash -c "$$NPX_CMD_PREFIX html-minifier --version &> /dev/null" || (echo "ERROR: html-minifier not found (via npx). Please run 'make install_npm_packages'" && exit 1)
	@echo "html-minifier: Found (via npx, version `bash -c \"$$NPX_CMD_PREFIX html-minifier --version\"`)"
	@echo "All necessary tools seem to be available."


# ==============================================================================
# Linting/Formatting/Minifying Target
# ==============================================================================
lint: check_deps format minify
	@echo ">>> Running final formatting pass (Tidy and Prettier)..."
	$(MAKE) format # Explicitly call the format target again
	@echo ">>> Performing final cleanup: Ensuring no space between closing tag and period..."
	$(HTML_FILES_FIND_CMD) -print0 | bash -c \
	'while IFS= read -r -d "" file; do \
		echo "Cleaning up spaces for: $$file"; \
		LC_ALL=C sed -i "s/>[[:space:]]*\./>./g" "$$file"; \
	done'
	@echo "Linting, formatting, minifying, and final cleanup complete."

format:
	@echo ">>> Formatting: Running HTML Tidy..."
	$(HTML_FILES_FIND_CMD) -exec tidy -config $(TIDY_CONFIG) -m {} \;
	@echo ">>> Formatting: Running Prettier..."
	@NPX_CMD_PREFIX=''; \
	if command -v nvm &> /dev/null; then \
		NPX_CMD_PREFIX="export NVM_DIR='$$HOME/.nvm' && [ -s '$$NVM_DIR/nvm.sh' ] && \. '$$NVM_DIR/nvm.sh' && npx"; \
	elif command -v npx &> /dev/null; then \
		NPX_CMD_PREFIX="npx"; \
	else \
		(echo "ERROR: npx command not found for Prettier." && exit 1); \
	fi; \
	bash -c "$$NPX_CMD_PREFIX prettier --write '*.htm' '*.html' --config .prettierrc.json --no-error-on-unmatched-pattern"

minify:
	@echo ">>> Minifying HTML files..."
	@NPX_CMD_PREFIX=''; \
	if command -v nvm &> /dev/null; then \
		NPX_CMD_PREFIX="export NVM_DIR='$$HOME/.nvm' && [ -s '$$NVM_DIR/nvm.sh' ] && \. '$$NVM_DIR/nvm.sh' && npx"; \
	elif command -v npx &> /dev/null; then \
		NPX_CMD_PREFIX="npx"; \
	else \
		(echo "ERROR: npx command not found for html-minifier." && exit 1); \
	fi; \
	$(HTML_FILES_FIND_CMD) -print0 | bash -c \
	'while IFS= read -r -d "" file; do \
		echo "Minifying \"$$file\"..."; \
		'"$$NPX_CMD_PREFIX"' html-minifier "$$file" -o "$$file" \
			--collapse-whitespace \
			--remove-comments \
			--remove-optional-tags \
			--remove-redundant-attributes \
			--remove-script-type-attributes \
			--remove-tag-whitespace \
			--use-short-doctype \
			--minify-css true \
			--minify-js true || echo "Warning: html-minifier failed for \"$$file\" (check errors above)"; \
	done'


# ==============================================================================
# Utility Target
# ==============================================================================
clean_node_modules:
	@echo ">>> Removing node_modules directory and package files..."
	@rm -rf node_modules package.json package-lock.json
	@echo "node_modules directory and package files removed."
