# PPIC Dashboard Backend - Documentation

Dokumentasi lengkap untuk PPIC Dashboard Backend API.

## 📚 Table of Contents

### Main Documentation
- **[CLAUDE.md](../CLAUDE.md)** - Dokumentasi API lengkap, endpoints, dan changelog

### Feature-Specific Guides

#### Attachment Management
- **[ATTACHMENT_RESILIENCE.md](ATTACHMENT_RESILIENCE.md)** - Panduan lengkap resilience untuk attachment deletion & download
- **[ATTACHMENT_RESILIENCE_SUMMARY.md](ATTACHMENT_RESILIENCE_SUMMARY.md)** - Ringkasan cepat perubahan attachment resilience

### Testing
- **[../tests/attachment-resilience.test.md](../tests/attachment-resilience.test.md)** - Test plan untuk attachment resilience
- **[../scripts/test-attachment-resilience.sh](../scripts/test-attachment-resilience.sh)** - Automated test script

### Deployment
- **[../DEPLOYMENT_CHECKLIST_ATTACHMENT.md](../DEPLOYMENT_CHECKLIST_ATTACHMENT.md)** - Checklist deployment untuk attachment resilience fix

---

## 🚀 Quick Start

### For Developers
1. Read **CLAUDE.md** for API overview
2. Check feature-specific guides for detailed implementation
3. Run tests before committing changes

### For QA/Testers
1. Review test plans in `tests/` directory
2. Run automated test scripts
3. Follow deployment checklists

### For DevOps
1. Review deployment checklists
2. Check monitoring requirements
3. Verify backup procedures

---

## 📖 Document Index

### By Topic

#### API Endpoints
- Project Endpoints → `CLAUDE.md`
- Phase Schedule → `CLAUDE.md` 
- Extensions → `CLAUDE.md`
- SAP Integration → `CLAUDE.md`
- Attachments → `CLAUDE.md` + `ATTACHMENT_RESILIENCE.md`

#### Error Handling
- Attachment Resilience → `ATTACHMENT_RESILIENCE.md`
- Known Issues → `CLAUDE.md` → Known Issues & Solutions

#### Testing
- Test Plans → `tests/` directory
- Test Scripts → `scripts/` directory
- Testing Checklist → `CLAUDE.md`

#### Deployment
- Deployment Checklists → `DEPLOYMENT_CHECKLIST_*.md`
- Migrations → `CLAUDE.md` → Migrations
- Environment Variables → `CLAUDE.md` → Environment Variables

---

## 🔍 Search Tips

### Find Endpoint Documentation
```bash
# Search in CLAUDE.md
grep -n "### GET /project" CLAUDE.md
grep -n "### POST /attachment" CLAUDE.md
```

### Find Error Solutions
```bash
# Search known issues
grep -n "Issue:" CLAUDE.md
```

### Find Test Cases
```bash
# Search test files
find tests/ -name "*.test.md" -exec grep -l "scenario" {} \;
```

---

## 📝 Contributing to Documentation

### Adding New Feature Documentation

1. **Update CLAUDE.md:**
   - Add endpoint documentation
   - Update table of contents
   - Add to Known Issues if applicable

2. **Create Feature Guide (if complex):**
   - Place in `docs/` directory
   - Use descriptive filename (e.g., `FEATURE_NAME_GUIDE.md`)
   - Link from this README

3. **Add Test Documentation:**
   - Create test plan in `tests/`
   - Add automated test script in `scripts/`
   - Update deployment checklist

4. **Update This README:**
   - Add to Table of Contents
   - Add to Document Index
   - Update Quick Start if needed

### Documentation Standards

#### Formatting
- Use Markdown with GitHub flavor
- Use emoji for visual hierarchy (📚 🚀 ✅ ❌ etc.)
- Include code examples with syntax highlighting
- Add table of contents for long documents

#### Structure
```markdown
# Title

## 🎯 Problem/Overview
Brief description

## ✅ Solution/Details
Implementation details

## 📋 Examples
Code examples

## 🧪 Testing
Test instructions

## 📚 References
Related documents
```

#### Code Examples
- Use triple backticks with language identifier
- Include complete working examples
- Add comments for complex logic
- Show both request and response

#### Diagrams (if needed)
- Use Mermaid for flowcharts
- Use ASCII art for simple diagrams
- Add alt text for accessibility

---

## 🔄 Documentation Updates

### Recent Updates

#### 2026-06-18
- ✅ Added attachment resilience documentation
- ✅ Created deployment checklist
- ✅ Added automated test scripts
- ✅ Updated CLAUDE.md with attachment endpoints

#### Previous Updates
See `CLAUDE.md` → Last Updated section

---

## 📞 Support

### For Documentation Issues
1. Check if topic exists in existing docs
2. Search for keywords
3. Review related documents
4. Contact backend team if still unclear

### For API Issues
1. Check `CLAUDE.md` → Known Issues
2. Review endpoint documentation
3. Check test cases for examples
4. Review error handling guide

---

## 🔗 External Resources

### Related Repositories
- Frontend: [Link to frontend repo]
- Database Migrations: [Link to migration repo]

### Tools
- API Testing: Postman, curl
- Log Viewing: ELK, CloudWatch
- Monitoring: Grafana, DataDog

### References
- Node.js Documentation: https://nodejs.org/docs
- MySQL Documentation: https://dev.mysql.com/doc
- Express.js Guide: https://expressjs.com/guide

---

**Last Updated:** 2026-06-18  
**Maintained By:** Backend Team  
**Questions?** Contact backend lead or create issue in repository
