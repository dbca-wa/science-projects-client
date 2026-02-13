# Change Management Process

## Overview

All production changes to the Science Projects Management System (SPMS) must follow the DBCA change management process via Freshservice. This ensures proper planning, communication, and risk management for system changes.

## When to Submit an RFC

Submit a Request For Change (RFC) for:

- Production deployments with new features
- Database schema changes
- Infrastructure changes (scaling, configuration updates)
- Security patches requiring system restart
- Major dependency upgrades
- Changes that may cause service interruption

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

**Implementation Plan**:
- Step-by-step procedure for implementing the change
- Estimated duration for each step
- Resources required (people, tools, access)
- Pre-requisites that must be completed first

**Rollback Plan**:
- Steps to revert the change if issues occur
- Time required to rollback
- Data backup verification
- Rollback decision criteria (when to abort)

**Test Plan**:
- How will the change be verified?
- What tests will be performed?
- Success criteria for each test
- Who will perform testing?

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
- Changes tested in UAT environment
- No database schema changes
- Rollback available if needed

**Dependencies**: None

### Implementation Plan

1. **Pre-deployment checks** (5 minutes)
   - Verify UAT testing completed successfully on Rancher UAT
   - Confirm database backup completed
   - Check Rancher cluster health

2. **Deploy to production** (15 minutes)
   - Update container image in Rancher
   - Perform rolling deployment (zero downtime)
   - Monitor pod startup and health checks

3. **Post-deployment verification** (10 minutes)
   - Verify application health in Rancher
   - Test user login and profile access
   - Check Sentry for errors
   - Review application logs

**Total Duration**: 30 minutes

**Resources Required**:
- Access to Rancher production cluster
- Access to Sentry monitoring
- Database backup verification

### Rollback Plan

**Rollback Steps** (10 minutes):
1. Revert container image to previous version in Rancher
2. Perform rolling deployment with old image
3. Verify application health
4. Notify users of rollback

**Rollback Decision Criteria**:
- Critical errors in Sentry (>10 errors/minute)
- User login failures (>5% failure rate)
- Database connection issues
- Performance degradation (>2 second response times)

**Data Considerations**: No database changes, no data loss on rollback

### Test Plan

**Smoke Tests** (5 minutes):
1. User login - verify successful authentication
2. Profile page - verify new features display correctly
3. Project search - verify results load quickly
4. Create project - verify form submission works

**Success Criteria**:
- All smoke tests pass
- No critical errors in Sentry
- Response times <1 second for key pages
- No user-reported issues in first 30 minutes

**Testing Performed By**: Tech Custodian

### Additional Notes

**Communication Plan**:
- Email to all users 24 hours before deployment
- Teams message to BCS staff 1 hour before deployment
- Post-deployment confirmation email

**Monitoring**:
- Monitor Sentry for 1 hour post-deployment
- Check Rancher logs for errors
- Review user feedback in first 24 hours

**Known Risks**:
- Minor: Users may need to refresh browser to see new features
- Mitigation: Include refresh instruction in communication

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

**Test First**: Always test in UAT before production

**Have a Rollback**: Never deploy without a rollback plan

**Communicate Early**: Give users advance notice of changes

**Monitor Closely**: Watch for issues immediately after deployment

**Document Everything**: Update RFC with actual outcomes

## Common Mistakes to Avoid

❌ **Insufficient testing**: Deploying without UAT verification

❌ **No rollback plan**: Not knowing how to revert if issues occur

❌ **Poor timing**: Deploying during business hours without justification

❌ **Vague descriptions**: Not explaining what is changing and why

❌ **Missing impact assessment**: Not identifying affected users/systems

❌ **No communication**: Surprising users with unexpected changes

## Related Documentation

- [Deployment Guide](../deployment/README.md) - Technical deployment procedures
- [Disaster Recovery](disaster-recovery.md) - Recovery procedures if deployment fails

## Contact

For questions about the RFC process:
- **OIM Service Desk**: https://dbca.freshservice.com/support/home
- **System ID**: S033 (Science Project Management System)
- **Department**: DBCA - Biodiversity and Conservation Science
