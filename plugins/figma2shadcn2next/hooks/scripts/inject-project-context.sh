#!/bin/bash
# figma2shadcn2next: SessionStart hook
# Injects project-specific Figma configuration into session context.
# Looks for .claude/figma-project.local.md in the current working directory.

CONFIG_FILE=".claude/figma-project.local.md"

if [ -f "$CONFIG_FILE" ]; then
  echo "# [figma2shadcn2next] Project Configuration Loaded"
  echo ""
  echo "The following project-specific Figma configuration is active for this session."
  echo "Use it to override defaults when running implement-figma-shadcn-next16."
  echo ""
  cat "$CONFIG_FILE"
else
  echo "# [figma2shadcn2next] No Project Config Found"
  echo ""
  echo "No .claude/figma-project.local.md found in this project."
  echo "The implement-figma-shadcn-next16 skill will use defaults:"
  echo "  - Token collections: usage / semantic / primitive"
  echo "  - Light/Dark strategy: css-variables (shadcn default)"
  echo "  - Output: current directory"
  echo ""
  echo "To customize, copy the template to your project:"
  echo "  cp \$CLAUDE_PLUGIN_ROOT/skills/implement-figma-shadcn-next16/templates/figma-project.local.example.md .claude/figma-project.local.md"
  echo "  # Then add .claude/figma-project.local.md to .gitignore"
fi
