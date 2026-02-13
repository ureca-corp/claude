#!/bin/bash

# URECA Claude Plugins - Complete Validation Script
# This script validates the entire marketplace structure and all plugins

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
        print_error "Missing field '$field' in $file"
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
    check_json_field ".claude-plugin/marketplace.json" ".repository"
    check_json_field ".claude-plugin/marketplace.json" ".plugins"

    # Check required files
    local required_files=(
        "README.md"
        "LICENSE"
        "CLAUDE.md"
        "CONTRIBUTING.md"
        "CHANGELOG.md"
    )

    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            print_error "Missing required file: $file"
        fi
    done

    # Check docs directory
    if [ -d "docs" ]; then
        print_success "Found: docs/ directory"

        local doc_files=(
            "docs/installation.md"
            "docs/plugin-development.md"
            "docs/troubleshooting.md"
        )

        for file in "${doc_files[@]}"; do
            if [ -f "$file" ]; then
                print_success "Found: $file"
            else
                print_warning "Missing documentation: $file"
            fi
        done
    else
        print_warning "docs/ directory not found"
    fi
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

    # Check required fields
    check_json_field "$plugin_json" ".name"
    check_json_field "$plugin_json" ".version"
    check_json_field "$plugin_json" ".description"
    check_json_field "$plugin_json" ".author"

    # Check required files
    local required_files=(
        "$plugin_dir/README.md"
    )

    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            print_error "Missing required file: $file"
        fi
    done

    # Check component directories
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
    fi

    # Validate skills
    if [ -d "$plugin_dir/skills" ]; then
        validate_skills "$plugin_dir/skills"
    fi

    # Validate commands
    if [ -d "$plugin_dir/commands" ]; then
        validate_commands "$plugin_dir/commands"
    fi

    # Validate agents
    if [ -d "$plugin_dir/agents" ]; then
        validate_agents "$plugin_dir/agents"
    fi

    # Validate hooks
    if [ -d "$plugin_dir/hooks" ]; then
        validate_hooks "$plugin_dir/hooks"
    fi
}

# Validate skills
validate_skills() {
    local skills_dir=$1

    print_info "Validating skills..."

    local skill_files=$(find "$skills_dir" -name "SKILL.md" 2>/dev/null)

    if [ -z "$skill_files" ]; then
        print_warning "No SKILL.md files found in $skills_dir"
        return 0
    fi

    for skill in $skill_files; do
        if grep -q "^---$" "$skill"; then
            print_success "Valid skill: $skill"

            # Check for required frontmatter fields
            if ! grep -A 10 "^---$" "$skill" | grep -q "name:"; then
                print_error "Missing 'name' in frontmatter: $skill"
            fi

            if ! grep -A 10 "^---$" "$skill" | grep -q "description:"; then
                print_error "Missing 'description' in frontmatter: $skill"
            fi
        else
            print_error "Missing frontmatter in: $skill"
        fi
    done
}

# Validate commands
validate_commands() {
    local commands_dir=$1

    print_info "Validating commands..."

    local command_files=$(find "$commands_dir" -name "SKILL.md" 2>/dev/null)

    if [ -z "$command_files" ]; then
        print_warning "No SKILL.md files found in $commands_dir"
        return 0
    fi

    for command in $command_files; do
        if grep -q "^---$" "$command"; then
            print_success "Valid command: $command"
        else
            print_error "Missing frontmatter in: $command"
        fi
    done
}

# Validate agents
validate_agents() {
    local agents_dir=$1

    print_info "Validating agents..."

    local agent_files=$(find "$agents_dir" -name "*.md" 2>/dev/null)

    if [ -z "$agent_files" ]; then
        print_warning "No agent files found in $agents_dir"
        return 0
    fi

    for agent in $agent_files; do
        if grep -q "^---$" "$agent"; then
            print_success "Valid agent: $agent"

            # Check for required frontmatter fields (either 'identifier' or 'name')
            local frontmatter=$(sed -n '/^---$/,/^---$/p' "$agent")
            if ! echo "$frontmatter" | grep -qE "(identifier:|name:)"; then
                print_error "Missing 'identifier' or 'name' in frontmatter: $agent"
            fi
        else
            print_error "Missing frontmatter in: $agent"
        fi
    done
}

# Validate hooks
validate_hooks() {
    local hooks_dir=$1

    print_info "Validating hooks..."

    if [ -f "$hooks_dir/hooks.json" ]; then
        validate_json "$hooks_dir/hooks.json"
    else
        print_warning "No hooks.json found in $hooks_dir"
    fi
}

# Check for broken links
check_links() {
    print_header "Checking Markdown Links"

    local md_files=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)

    local broken_links=()

    for md_file in $md_files; do
        # Extract markdown links
        local links=$(grep -oP '\[.*?\]\(\K[^)]+(?=\))' "$md_file" 2>/dev/null || true)

        for link in $links; do
            # Skip external links
            if [[ $link == http* ]] || [[ $link == mailto:* ]]; then
                continue
            fi

            # Skip anchor links
            if [[ $link == \#* ]]; then
                continue
            fi

            # Skip template links (output files that will be generated)
            if [[ $md_file == */templates/* ]] || [[ $md_file == */agents/* ]]; then
                if [[ $link == ./features.md ]] || \
                   [[ $link == ./domain-model.md ]] || \
                   [[ $link == ./api-spec.md ]] || \
                   [[ $link == ./business-rules.md ]] || \
                   [[ $link == ./README.md ]]; then
                    continue
                fi
            fi

            # Resolve relative path
            local dir=$(dirname "$md_file")
            local resolved_path="$dir/$link"

            # Remove ./ prefix
            resolved_path="${resolved_path#./}"

            # Check if file exists
            if [ ! -f "$resolved_path" ] && [ ! -d "$resolved_path" ]; then
                broken_links+=("$md_file -> $link")
            fi
        done
    done

    if [ ${#broken_links[@]} -gt 0 ]; then
        print_error "Broken links found:"
        for link in "${broken_links[@]}"; do
            echo "  $link"
        done
    else
        print_success "All links are valid"
    fi
}

# Main function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║        URECA Claude Plugins Validation Script           ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

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

    # Check links
    check_links

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
