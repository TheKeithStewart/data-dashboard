# Deployment Checklist: [Project Name]

**Project ID**: [project-name]
**Deployment Date**: [YYYY-MM-DD]
**Environment**: [Preview / Staging / Production]
**Deployed By**: [Name]

## Pre-Deployment Verification

### Code Quality
- [ ] All tests passing (`npx playwright test`)
- [ ] Test coverage ≥ 90%
- [ ] TypeScript compilation clean (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted with Prettier
- [ ] No console.log statements in production code
- [ ] No TODO comments requiring immediate action

### Application Readiness
- [ ] All features implemented per design specifications
- [ ] Design fidelity verified against Figma
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] All user flows tested end-to-end
- [ ] Error states handled gracefully
- [ ] Loading states implemented
- [ ] Empty states designed and implemented

### Performance
- [ ] Next.js production build successful
- [ ] Build time < 2 minutes
- [ ] Bundle size analyzed and optimized
- [ ] Images optimized with next/image
- [ ] Fonts optimized with next/font
- [ ] Code splitting implemented where appropriate
- [ ] Core Web Vitals targets met:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation functional
- [ ] Focus indicators visible
- [ ] ARIA labels present on interactive elements
- [ ] Color contrast ratios meet requirements (≥ 4.5:1)
- [ ] Screen reader testing completed
- [ ] Semantic HTML used throughout

### Security
- [ ] No secrets committed to repository
- [ ] Environment variables documented in `.env.example`
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] CORS configured correctly for API routes
- [ ] Authentication working (if applicable)
- [ ] Authorization rules implemented (if applicable)
- [ ] Rate limiting on API routes (if applicable)
- [ ] Input validation and sanitization

### Git & Version Control
- [ ] All changes committed
- [ ] Meaningful commit messages
- [ ] No merge conflicts
- [ ] Branch up to date with main
- [ ] Git tags created for release (if applicable)

## Vercel Configuration

### Project Setup
- [ ] Vercel project created
- [ ] Git repository linked to Vercel
- [ ] Framework preset: Next.js
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`

### Configuration Files
- [ ] `vercel.json` created with:
  - [ ] Build commands specified
  - [ ] Security headers configured
  - [ ] Redirects/rewrites set up (if needed)
  - [ ] Region preference set (if applicable)
- [ ] `next.config.js` optimized:
  - [ ] Image domains configured
  - [ ] React strict mode enabled
  - [ ] SWC minification enabled
  - [ ] Security headers defined

### Environment Variables

#### Development
- [ ] All development variables documented
- [ ] `.env.local` configured locally
- [ ] No secrets in `.env.local` committed

#### Preview
- [ ] Preview environment variables set in Vercel
- [ ] API keys for preview environment configured
- [ ] Database URL for preview environment
- [ ] Third-party service credentials (preview)
- [ ] Feature flags configured for preview

#### Production
- [ ] Production environment variables set in Vercel
- [ ] Production API keys configured
- [ ] Production database URL configured
- [ ] Third-party service credentials (production)
- [ ] Feature flags configured for production
- [ ] Analytics tracking ID (if applicable)

**Environment Variable Checklist**:
```bash
# Public variables (NEXT_PUBLIC_*)
- [ ] NEXT_PUBLIC_APP_URL
- [ ] NEXT_PUBLIC_API_URL
- [ ] [Other public variables]

# Private variables (server-only)
- [ ] DATABASE_URL
- [ ] API_SECRET_KEY
- [ ] [Other private variables]

# Vercel system variables (auto-configured)
- [ ] VERCEL_ENV
- [ ] VERCEL_URL
- [ ] VERCEL_GIT_COMMIT_SHA
```

## Preview Deployment

### Deploy to Preview
- [ ] Run `vercel` command or push to feature branch
- [ ] Preview URL generated
- [ ] Deployment succeeded without errors
- [ ] Build logs reviewed for warnings

### Preview Verification
- [ ] Application loads at preview URL
- [ ] Home page renders correctly
- [ ] All routes accessible
- [ ] Navigation working
- [ ] Forms submitting correctly
- [ ] API routes responding
- [ ] Images loading properly
- [ ] Styles applied correctly
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified

### Preview Testing
- [ ] Run Playwright tests against preview URL:
  ```bash
  PLAYWRIGHT_TEST_BASE_URL=https://[preview-url] npx playwright test
  ```
- [ ] All critical user journeys tested manually
- [ ] Performance checked in preview
- [ ] Accessibility verified in preview
- [ ] Different browsers tested (Chrome, Firefox, Safari)

### Preview Approval
- [ ] Stakeholder review completed
- [ ] Design fidelity approved
- [ ] Functionality approved
- [ ] No blockers identified
- [ ] Approval documented

## Production Deployment

### Pre-Production Checklist
- [ ] Preview deployment verified and approved
- [ ] All tests passing in preview
- [ ] Performance acceptable in preview
- [ ] No critical bugs identified
- [ ] Stakeholder sign-off obtained

### Deploy to Production
- [ ] Run `vercel --prod` or merge to main branch
- [ ] Production deployment initiated
- [ ] Build completed successfully
- [ ] Production URL updated

### Production Verification (Immediate)
- [ ] Application loads at production URL
- [ ] Home page renders correctly
- [ ] Critical paths tested:
  - [ ] User authentication (if applicable)
  - [ ] Main features functional
  - [ ] Forms working
  - [ ] Data persistence working
- [ ] No console errors
- [ ] SSL certificate active
- [ ] HTTPS enforced

### Production Verification (Detailed)
- [ ] All pages accessible
- [ ] Navigation working correctly
- [ ] API routes responding
- [ ] Images loading and optimized
- [ ] Fonts loading correctly
- [ ] Styles applied correctly
- [ ] Animations and transitions working
- [ ] Mobile responsiveness verified
- [ ] Tablet responsiveness verified
- [ ] Desktop display optimal

### Performance Verification
- [ ] Run Lighthouse audit:
  - [ ] Performance score ≥ 90
  - [ ] Accessibility score ≥ 95
  - [ ] Best Practices score ≥ 95
  - [ ] SEO score ≥ 90
- [ ] Core Web Vitals checked in production:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Page load times acceptable
- [ ] Time to Interactive < 3s

### Security Verification
- [ ] Security headers present:
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Strict-Transport-Security (HSTS)
  - [ ] Content-Security-Policy (if configured)
- [ ] SSL certificate valid and trusted
- [ ] HTTPS redirects working
- [ ] No mixed content warnings
- [ ] API authentication working (if applicable)

## Post-Deployment

### Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry, etc. - if applicable)
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured (if applicable)
- [ ] Alerts configured for:
  - [ ] Build failures
  - [ ] Runtime errors
  - [ ] Performance degradation
  - [ ] Downtime

### Documentation
- [ ] Deployment documented:
  - [ ] Version/tag recorded
  - [ ] Deployment timestamp
  - [ ] Changes deployed (changelog)
  - [ ] Known issues (if any)
- [ ] Environment configuration documented
- [ ] Rollback procedure documented
- [ ] Monitoring dashboard links documented

### Communication
- [ ] Stakeholders notified of deployment
- [ ] Team informed of new production version
- [ ] Users notified (if applicable)
- [ ] Release notes published (if applicable)

### Post-Deployment Testing (24-48 hours)
- [ ] Monitor error rates
- [ ] Review performance metrics
- [ ] Check user feedback
- [ ] Verify analytics data flowing
- [ ] No increase in error rates
- [ ] Performance stable
- [ ] No user-reported critical issues

## CI/CD Pipeline Setup

### Git Integration
- [ ] Vercel GitHub/GitLab/Bitbucket integration configured
- [ ] Automatic deployments enabled:
  - [ ] `main` branch → Production
  - [ ] `staging` branch → Staging (if applicable)
  - [ ] Feature branches → Preview
  - [ ] Pull requests → Preview

### Branch Protection
- [ ] Branch protection rules enabled on `main`:
  - [ ] Require pull request reviews
  - [ ] Require status checks to pass
  - [ ] Require up-to-date branches
  - [ ] Prevent force pushes
  - [ ] Prevent deletion

### Deployment Workflow
- [ ] Feature branch workflow documented:
  1. Create feature branch
  2. Implement changes
  3. Push triggers preview deployment
  4. Review preview deployment
  5. Create pull request
  6. Automated tests run
  7. Code review completed
  8. Merge to main triggers production deployment
- [ ] Team trained on workflow
- [ ] Deployment guide created

## Custom Domain Setup (If Applicable)

### Domain Configuration
- [ ] Custom domain purchased/available
- [ ] Domain added in Vercel dashboard
- [ ] DNS configured:
  - [ ] A record pointing to Vercel
  - [ ] CNAME record for www subdomain (if applicable)
  - [ ] Or Vercel nameservers configured
- [ ] DNS propagation verified (can take 24-48 hours)

### SSL Certificate
- [ ] Let's Encrypt certificate provisioned automatically
- [ ] Certificate status: Valid
- [ ] Certificate expiration: Auto-renew enabled
- [ ] HTTPS enforced on custom domain
- [ ] www redirect configured (if applicable)

### Domain Verification
- [ ] Custom domain resolves correctly
- [ ] HTTPS working on custom domain
- [ ] Redirect from www to apex (or vice versa) working
- [ ] Old URLs redirecting if applicable

## Rollback Procedure

### Rollback Preparation
- [ ] Previous stable deployment identified
- [ ] Rollback procedure documented
- [ ] Team aware of rollback process

### Rollback Steps (If Needed)
1. [ ] Navigate to Vercel dashboard
2. [ ] Find previous successful deployment
3. [ ] Click "Promote to Production"
4. [ ] Verify rollback successful
5. [ ] Notify team of rollback
6. [ ] Investigate and fix issue
7. [ ] Re-deploy when ready

### Rollback Testing
- [ ] Rollback procedure tested in preview environment
- [ ] Team trained on rollback process
- [ ] Rollback decision criteria defined

## Troubleshooting

### Common Issues Checklist

#### Build Failures
- [ ] Check build logs in Vercel dashboard
- [ ] Verify all dependencies installed
- [ ] Check for TypeScript errors
- [ ] Verify environment variables set
- [ ] Check node version compatibility

#### Runtime Errors
- [ ] Check runtime logs in Vercel
- [ ] Verify environment variables configured
- [ ] Check API route errors
- [ ] Verify database connections
- [ ] Check for CORS issues

#### Performance Issues
- [ ] Review Vercel Analytics
- [ ] Check for unoptimized images
- [ ] Verify caching configured correctly
- [ ] Review bundle size
- [ ] Check for unnecessary re-renders

#### Security Issues
- [ ] Verify security headers present
- [ ] Check for exposed secrets
- [ ] Verify HTTPS enforced
- [ ] Check CORS configuration
- [ ] Review authentication implementation

## Success Criteria

### Deployment Success
- [X] Preview deployment successful
- [X] All tests passing in preview
- [X] Preview approved by stakeholders
- [X] Production deployment successful
- [X] All verification checks passed

### Performance Success
- [X] Lighthouse Performance ≥ 90
- [X] Core Web Vitals in green
- [X] Build time acceptable
- [X] Page load times optimal

### Security Success
- [X] All security headers configured
- [X] HTTPS enforced
- [X] No secrets exposed
- [X] Authentication working (if applicable)

### Operational Success
- [X] Monitoring configured
- [X] CI/CD pipeline working
- [X] Documentation complete
- [X] Team trained

## Sign-Off

### Deployment Approval
**Preview Deployment**:
- Deployed: [Date & Time]
- URL: [Preview URL]
- Approved By: [Name]
- Status: ✅ Approved / ❌ Rejected

**Production Deployment**:
- Deployed: [Date & Time]
- URL: [Production URL]
- Approved By: [Name]
- Status: ✅ Successful

### Post-Deployment Confirmation
**24-Hour Check**:
- Date: [Date]
- Error Rate: [Rate]
- Performance: ✅ Stable
- User Issues: [None / List]
- Status: ✅ Healthy

**48-Hour Check**:
- Date: [Date]
- Error Rate: [Rate]
- Performance: ✅ Stable
- User Issues: [None / List]
- Status: ✅ Healthy

### Final Sign-Off
**Deployment Complete**: ✅
**Production Stable**: ✅
**Monitoring Active**: ✅
**Documentation Complete**: ✅

**Signed**: [Name]
**Date**: [YYYY-MM-DD]
**Role**: [Role]

## References

- **Vercel Dashboard**: [URL]
- **GitHub Repository**: [URL]
- **Production URL**: [URL]
- **Design Specifications**: [Path]
- **Implementation Log**: [Path]
- **Technical Documentation**: [Path]
- **Monitoring Dashboard**: [URL]

## Appendix

### Useful Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Promote previous deployment
vercel promote [deployment-url] --prod

# View domains
vercel domains ls

# Add environment variable
vercel env add [VAR_NAME] [environment]
```

### Emergency Contacts
- **Technical Lead**: [Name, Contact]
- **DevOps**: [Name, Contact]
- **Product Owner**: [Name, Contact]
- **Vercel Support**: support@vercel.com

### Important URLs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Project Repository**: [URL]
- **Design Files**: [Figma URL]
