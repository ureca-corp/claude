#!/bin/bash

# URECA Claude Plugins - Validation Script (Official Docs Compliant)
# Validates only what is officially required by Claude Code plugin system
# Reference: https://code.claude.com/docs/en/plugins

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

# Print functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate JSON syntax
validate_json() {
    local file=$1
    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi

    if ! jq empty "$file" 2>/dev/null; then
        print_error "Invalid JSON: $file"
        return 1
    fi

    print_success "Valid JSON: $file"
    return 0
}

# Check required fields in JSON
check_json_field() {
    local file=$1
    local field=$2

    if ! jq -e "$field" "$file" >/dev/null 2>&1; then
        print_error "Missing required field '$field' in $file"
        return 1
    fi

    return 0
}

# Validate marketplace structure
validate_marketplace() {
    print_header "Validating Marketplace Structure"

    # Check marketplace.json
    if [ ! -f ".claude-plugin/marketplace.json" ]; then
        print_error "marketplace.json not found"
        return 1
    fi

    validate_json ".claude-plugin/marketplace.json"

    # Check required fields
    check_json_field ".claude-plugin/marketplace.json" ".name"
    check_json_field ".claude-plugin/marketplace.json" ".plugins"

    # Check required files
    local required_files=(
        "README.md"
        "LICENSE"
    )

    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            print_error "Missing required file: $file"
        fi
    done
}

# Validate plugin structure
validate_plugin() {
    local plugin_name=$1
    local plugin_dir="plugins/$plugin_name"

    print_header "Validating Plugin: $plugin_name"

    # Check plugin directory
    if [ ! -d "$plugin_dir" ]; then
        print_error "Plugin directory not found: $plugin_dir"
        return 1
    fi

    # Check plugin.json
    local plugin_json="$plugin_dir/.claude-plugin/plugin.json"
    if [ ! -f "$plugin_json" ]; then
        print_error "plugin.json not found: $plugin_json"
        return 1
    fi

    validate_json "$plugin_json"

    # Check required fields per official docs
    check_json_field "$plugin_json" ".name"
    check_json_field "$plugin_json" ".version"
    check_json_field "$plugin_json" ".description"

    # Check required files
    if [ -f "$plugin_dir/README.md" ]; then
        print_success "Found: README.md"
    else
        print_error "Missing required file: README.md"
    fi

    # Check component directories (at least one must exist)
    local has_component=false
    local component_dirs=(
        "$plugin_dir/skills"
        "$plugin_dir/commands"
        "$plugin_dir/agents"
        "$plugin_dir/hooks"
    )

    for dir in "${component_dirs[@]}"; do
        if [ -d "$dir" ]; then
            has_component=true
            print_success "Found component directory: $(basename $dir)"
        fi
    done

    if [ "$has_component" = false ]; then
        print_error "No component directories found (skills/commands/agents/hooks)"
        print_info "Per official docs: plugin must have at least one component directory"
    fi

    # Verify components are not inside .claude-plugin/ (common mistake)
    if [ -d "$plugin_dir/.claude-plugin/commands" ] || \
       [ -d "$plugin_dir/.claude-plugin/skills" ] || \
       [ -d "$plugin_dir/.claude-plugin/agents" ] || \
       [ -d "$plugin_dir/.claude-plugin/hooks" ]; then
        print_error "Component directories found inside .claude-plugin/"
        print_info "Components must be at plugin root, not inside .claude-plugin/"
        print_info "See: https://code.claude.com/docs/en/plugins#plugin-structure-overview"
    else
        print_success "Components are correctly placed at plugin root"
    fi
}

# Main function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║   URECA Claude Plugins Validation (Official Compliant)  ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    print_info "Validating according to https://code.claude.com/docs/en/plugins"
    echo ""

    # Check prerequisites
    if ! command_exists jq; then
        print_error "jq is not installed. Please install it first."
        echo "  macOS:   brew install jq"
        echo "  Ubuntu:  sudo apt-get install jq"
        echo "  Windows: choco install jq"
        exit 1
    fi

    # Validate marketplace
    validate_marketplace

    # Get list of plugins from marketplace.json
    local plugins=$(jq -r '.plugins[].name' .claude-plugin/marketplace.json 2>/dev/null)

    if [ -z "$plugins" ]; then
        print_error "No plugins found in marketplace.json"
    else
        for plugin in $plugins; do
            validate_plugin "$plugin"
        done
    fi

    # Print summary
    print_header "Validation Summary"

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}"
        echo "╔══════════════════════════════════════════════════════════╗"
        echo "║                                                          ║"
        echo "║                 ✅ ALL VALIDATIONS PASSED               ║"
        echo "║                                                          ║"
        echo "╚══════════════════════════════════════════════════════════╝"
        echo -e "${NC}"
        exit 0
    else
        echo -e "${RED}Errors: $ERRORS${NC}"
        echo -e "${YELLOW}Warnings: $WARNINGS${NC}"

        if [ $ERRORS -gt 0 ]; then
            echo -e "\n${RED}Validation failed with $ERRORS error(s).${NC}"
            exit 1
        else
            echo -e "\n${YELLOW}Validation completed with $WARNINGS warning(s).${NC}"
            exit 0
        fi
    fi
}

# Run main function
main
