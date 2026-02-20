# Security Policy

## Supported Versions

We actively support the following versions of URECA Claude Plugins marketplace:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of URECA Claude Plugins seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Publicly Disclose

Please do **not** create a public GitHub issue for security vulnerabilities. This helps protect users while we work on a fix.

### 2. Report Privately

Send a detailed report to:
- **Email**: security@ureca.team (placeholder)
- **Subject**: `[SECURITY] Brief description of the vulnerability`

### 3. Include in Your Report

Please include as much information as possible:

- **Description**: Clear description of the vulnerability
- **Impact**: What can an attacker do with this vulnerability?
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Affected Versions**: Which versions are affected?
- **Proof of Concept**: Code or commands demonstrating the issue (if applicable)
- **Suggested Fix**: If you have ideas for how to fix it

**Example Report**:
```
Subject: [SECURITY] Command injection in plugin validation script

Description:
The validate-all.sh script in scripts/ directory is vulnerable to command injection
when processing plugin names with special characters.

Impact:
An attacker could create a malicious plugin with a crafted name that executes
arbitrary commands when the validation script runs.

Steps to Reproduce:
1. Create a plugin with name: plugin-name'; malicious-command #
2. Run ./scripts/validate-all.sh
3. malicious-command is executed

Affected Versions:
- v1.0.0

Proof of Concept:
[Include code or commands]

Suggested Fix:
Properly quote all variables and use arrays for command arguments.
```

### 4. Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Development**: Depends on severity
  - **Critical**: Within 7 days
  - **High**: Within 14 days
  - **Medium**: Within 30 days
  - **Low**: Next release cycle

### 5. Disclosure Process

Once a fix is ready:

1. **Patch Release**: We'll release a patch version
2. **Security Advisory**: We'll publish a GitHub Security Advisory
3. **Credit**: We'll credit you (unless you prefer to remain anonymous)
4. **Public Disclosure**: After users have time to update (typically 7-14 days)

## Security Best Practices for Plugin Developers

### 1. Input Validation

Always validate and sanitize user input:

```markdown
<!-- ❌ Bad: Direct command injection risk -->
run: echo "${{ github.event.issue.title }}"

<!-- ✅ Good: Use environment variables -->
env:
  TITLE: ${{ github.event.issue.title }}
run: echo "$TITLE"
```

### 2. File System Access

Be cautious when accessing files:

```bash
# ❌ Bad: Path traversal risk
cat "../../../etc/passwd"

# ✅ Good: Validate paths
if [[ "$file" == ../* ]]; then
  echo "Path traversal not allowed"
  exit 1
fi
```

### 3. Secrets Management

Never hardcode sensitive information:

```json
// ❌ Bad
{
  "apiKey": "sk_live_abcd1234",
  "password": "mypassword"
}

// ✅ Good
{
  "apiKeyEnvVar": "PLUGIN_API_KEY",
  "passwordEnvVar": "PLUGIN_PASSWORD"
}
```

### 4. Hook Security

Hooks can execute arbitrary code. Be careful:

```json
// ❌ Bad: Eval-like behavior
{
  "event": "PreToolUse",
  "type": "command",
  "command": "eval",
  "args": ["${USER_INPUT}"]
}

// ✅ Good: Restricted script
{
  "event": "PreToolUse",
  "type": "command",
  "command": "bash",
  "args": ["${PLUGIN_ROOT}/hooks/validate.sh"]
}
```

### 5. Dependency Security

- Keep dependencies up to date
- Review third-party code before integration
- Use official, verified sources

## Common Vulnerabilities to Avoid

### 1. Command Injection

**Risk**: Attacker can execute arbitrary commands

**Prevention**:
- Always quote shell variables
- Use arrays for command arguments
- Validate input before using in commands

### 2. Path Traversal

**Risk**: Attacker can access files outside intended directory

**Prevention**:
- Validate all file paths
- Reject `..` in paths
- Use absolute paths when possible

### 3. Code Injection

**Risk**: Attacker can inject malicious code

**Prevention**:
- Never use `eval` or equivalent
- Sanitize all dynamic code
- Use parameterized queries for data

### 4. Sensitive Data Exposure

**Risk**: Leaking credentials, tokens, or private information

**Prevention**:
- Use environment variables for secrets
- Never commit secrets to Git
- Use `.gitignore` for sensitive files

### 5. Dependency Vulnerabilities

**Risk**: Vulnerable dependencies can be exploited

**Prevention**:
- Regular security audits
- Keep dependencies updated
- Review dependency security advisories

## Security Checklist for PRs

Before submitting a PR, ensure:

- [ ] No hardcoded secrets or credentials
- [ ] All user input is validated and sanitized
- [ ] File paths are validated (no `..`)
- [ ] Shell commands use proper quoting
- [ ] No `eval` or equivalent used
- [ ] Environment variables used for sensitive data
- [ ] Third-party code reviewed for security
- [ ] GitHub Actions workflows follow security best practices
- [ ] No unnecessary file system permissions

## Known Security Considerations

### Plugin Execution Model

- Plugins run with user's permissions
- Plugins can access user's file system
- Plugins can execute shell commands
- Users should only install trusted plugins

### Marketplace Security

- Git-based distribution (requires Git access)
- No code signing currently implemented
- Manual review process for contributed plugins

## Security Update Policy

### Critical Vulnerabilities

- Immediate patch release
- Public disclosure after 7 days
- Security advisory published

### High Severity

- Patch within 14 days
- Public disclosure after 14 days
- Security advisory published

### Medium/Low Severity

- Included in next regular release
- Mentioned in CHANGELOG
- No separate advisory (unless severe impact)

## Questions?

If you have questions about security:
- **General Questions**: [GitHub Discussions](https://github.com/ureca-corp/claude/discussions)
- **Security Concerns**: security@ureca.team

## Acknowledgments

We thank the security researchers and community members who responsibly disclose vulnerabilities to help keep URECA Claude Plugins secure.

### Hall of Fame

Security researchers who have helped improve our security:
- [Your name could be here!]

---

**Thank you for helping keep URECA Claude Plugins and our users safe!** 🔐
