# Change Management Process

## Overview

All production changes to the Science Projects Management System (SPMS) must follow the DBCA change management process via Freshservice. This ensures proper planning, communication, and risk management for system changes.

This process applies to both frontend and backend deployments.

## When to Submit an RFC

Submit a Request For Change (RFC) for:

- Production deployments with new features (frontend or backend)
- Database schema changes
- Infrastructure changes (scaling, configuration updates)
- Security patches requiring system restart
- Major dependency upgrades
- Changes that may cause service interruption
- Frontend build configuration changes
- Backend API changes affecting frontend

**Note**: Minor bug fixes and routine maintenance may not require an RFC - consult with OIM if unsure.

## RFC Submission Process

### Step 1: Access Freshservice

Visit the DBCA Freshservice portal:
- URL: https://dbca.freshservice.com/support/home
- Log in with your DBCA credentials

### Step 2: Create Request

**Option A: Request For Change (Preferred)**
1. Select "Request For Change" from the service catalogue
2. If not available, use Option B

**Option B: Ticket (Alternative)**
1. Navigate to "Tickets" → "New Ticket" → "Report an Issue"
2. Fill in:
   - **Subject**: Brief description of change (e.g., "SPMS Production Deployment - v2.3.0")
   - **Type of Incident**: Select appropriate category
   - **System ID**: S033 (Science Project Management System)
   - **Description**: Detailed description of the change

### Step 3: Complete RFC Details

**Department**:
- Set to: DBCA - Biodiversity and Conservation Science

**Subject and Description**:
- **Subject**: Clear, concise summary (e.g., "SPMS Production Deployment - Feature X")
- **Description**: Detailed explanation of what is changing and why
- **Component**: Specify if frontend, backend, or both

**Timing**:
- **Planned Start Date**: When change will begin
- **Planned End Date**: When change will complete
- **Change Type**: Normal (for standard deployments)

**Responsibility**:
- **Who Will Action Change**:
  - OIM (for infrastructure changes)
  - Tech Custodian (for application deployments)
  - Vendor (if third-party involved)
- **Change Implementer**: Name of person performing the change
- **Communication Required**: Yes/No (whether users need notification)

**Change Classification**:
- **BAU Change**: Business As Usual (routine deployment)
- **Project Change**: Part of larger project initiative
- **Outage Required**: Yes/No (whether system will be unavailable)

### Step 4: Provide Planning Documentation

**Impact Assessment**:
- Who will be affected by this change?
- What functionality will be impacted?
- What is the risk level (Low/Medium/High)?
- Are there any dependencies on other systems?
- Does this affect frontend, backend, or both?

**Implementation Plan**:
- Step-by-step procedure for implementing the change
- Estimated duration for each step
- Resources required (people, tools, access)
- Pre-requisites that must be completed first
- Deployment order (if both frontend and backend)

**Rollback Plan**:
- Steps to revert the change if issues occur
- Time required to rollback
- Data backup verification
- Rollback decision criteria (when to abort)
- Component-specific rollback procedures

**Test Plan**:
- How will the change be verified?
- What tests will be performed?
- Success criteria for each test
- Who will perform testing?
- Frontend and backend integration testing

**Additional Notes**:
- Any special considerations
- Known risks or concerns
- Communication plan for stakeholders
- Post-implementation monitoring plan

## Example RFC: Production Deployment

### Subject
SPMS Production Deployment - User Profile Enhancements v2.3.0

### Description
Deploy version 2.3.0 of SPMS to production environment. This release includes user profile enhancements, bug fixes, and performance improvements.

**Components**: Frontend and Backend

### Timing
- **Planned Start**: 10-02-2026 18:00 AWST
- **Planned End**: 10-02-2026 18:30 AWST
- **Change Type**: Normal

### Responsibility
- **Who Will Action**: Tech Custodian
- **Change Implementer**: [Your Name]
- **Communication Required**: No

### Classification
- **Change Type**: BAU Change
- **Outage Required**: No (rolling deployment)

### Impact Assessment
**Affected Users**: All SPMS users

**Impacted Functionality**:
- User profile pages (enhanced features)
- Project search (performance improvement)
- No functionality removed or broken

**Risk Level**: Low
- Changes tested in staging environment
- No database schema changes
- Rollback available if needed

**Dependencies**: None

**Components**: Frontend (React) and Backend (Django API)

### Implementation Plan

1. **Pre-deployment checks** (5 minutes)
   - Verify staging testing completed successfully
   - Confirm database backup completed
   - Check Rancher cluster health
   - Verify frontend build completed successfully

2. **Deploy backend** (10 minutes)
   - Update container image in Rancher
   - Perform rolling deployment (zero downtime)
   - Monitor pod startup and health checks
   - Verify API endpoints responding

3. **Deploy frontend** (5 minutes)
   - Upload new build to Azure Blob Storage
   - Purge CDN cache
   - Verify static assets loading

4. **Post-deployment verification** (10 minutes)
   - Verify application health in Rancher
   - Test user login and profile access
   - Check Sentry for errors (frontend and backend)
   - Review application logs
   - Test frontend-backend integration

**Total Duration**: 30 minutes

**Resources Required**:
- Access to Rancher production cluster
- Access to Azure Blob Storage
- Access to Sentry monitoring
- Database backup verification

### Rollback Plan

**Rollback Steps** (15 minutes):
1. **Frontend**: Restore previous build from Azure Blob Storage, purge CDN cache
2. **Backend**: Revert container image to previous version in Rancher
3. Perform rolling deployment with old image
4. Verify application health
5. Notify users of rollback

**Rollback Decision Criteria**:
- Critical errors in Sentry (>10 errors/minute)
- User login failures (>5% failure rate)
- Database connection issues
- Performance degradation (>2 second response times)
- Frontend-backend integration failures

**Data Considerations**: No database changes, no data loss on rollback

### Test Plan

**Smoke Tests** (5 minutes):
1. User login - verify successful authentication
2. Profile page - verify new features display correctly
3. Project search - verify results load quickly
4. Create project - verify form submission works
5. Frontend-backend integration - verify API calls working

**Success Criteria**:
- All smoke tests pass
- No critical errors in Sentry (frontend or backend)
- Response times <1 second for key pages
- No user-reported issues in first 30 minutes
- Frontend assets loading correctly from CDN

**Testing Performed By**: Tech Custodian

### Additional Notes

**Communication Plan**:
- Email to all users 24 hours before deployment
- Teams message to BCS staff 1 hour before deployment
- Post-deployment confirmation email

**Monitoring**:
- Monitor Sentry for 1 hour post-deployment (frontend and backend)
- Check Rancher logs for errors
- Monitor CDN performance
- Review user feedback in first 24 hours

**Known Risks**:
- Minor: Users may need to refresh browser to see new features
- Mitigation: Include refresh instruction in communication
- Minor: CDN cache may take a few minutes to purge
- Mitigation: Monitor CDN purge status

## Post-RFC Submission

After submitting the RFC:

1. **Await Approval**: OIM will review and approve/reject the RFC (generally Tuesday meeting if request in before that and Thursday approval if load is light)
2. **Address Feedback**: Respond to any questions or concerns raised
3. **Confirm Timing**: Verify planned start/end times are still valid
4. **Prepare Resources**: Ensure all required access and tools are ready
5. **Execute Change**: Follow the implementation plan exactly as documented
6. **Update RFC**: Document actual start/end times and any deviations
7. **Close RFC**: Confirm successful completion or document rollback

## Tips for Successful RFCs

**Be Specific**: Vague descriptions lead to delays and questions

**Plan Thoroughly**: A good implementation plan prevents issues

**Test First**: Always test in staging before production

**Have a Rollback**: Never deploy without a rollback plan

**Communicate Early**: Give users advance notice of changes

**Monitor Closely**: Watch for issues immediately after deployment

**Document Everything**: Update RFC with actual outcomes

**Consider Dependencies**: Plan deployment order for frontend and backend

## Common Mistakes to Avoid

❌ **Insufficient testing**: Deploying without staging verification

❌ **No rollback plan**: Not knowing how to revert if issues occur

❌ **Poor timing**: Deploying during business hours without justification

❌ **Vague descriptions**: Not explaining what is changing and why

❌ **Missing impact assessment**: Not identifying affected users/systems

❌ **No communication**: Surprising users with unexpected changes

❌ **Wrong deployment order**: Deploying frontend before backend when API changes exist

❌ **Forgetting CDN cache**: Not purging CDN cache after frontend deployment

## Related Documentation

- **Frontend Architecture**: `../../frontend/architecture/` - Frontend-specific architecture
- **Backend Architecture**: `../../backend/architecture/` - Backend-specific architecture
- **General Deployment**: `../deployment/` - Monorepo-wide deployment strategy
- **Disaster Recovery**: `disaster-recovery.md` - Recovery procedures if deployment fails

## Contact

For questions about the RFC process:
- **OIM Service Desk**: https://dbca.freshservice.com/support/home
- **System ID**: S033 (Science Project Management System)
- **Department**: DBCA - Biodiversity and Conservation Science
