# Cardinal

## Concepts

__Scoped__ Means belonging to an organization (contains an org_id)

__Unscoped__ Means NOT-belonging to any organization (essentially global)

## Tokens

Static hashes available once as the result of the create method, and then used to make requests to journey micro-services
in place of the JWT tokens used on most of the journey UIs (oxide, admin portal etc..).

Much like developers, tokens are assigned policies giving them specific access to various resources.

### Unscoped tokens

These are tokens which do not belong to organizations

### Scoped tokens

These are tokens which belong to a specific organization.

__Organization access tokens__

Global within an organization, these are useful for scenarios such as integrations or server-to-server access.
Other examples include CI etc..

__User access tokens__

A recent new addition: While scoped to an organization, they are additionally associated with a developer
and intended to be used as personal access tokens (pats). Use-cases for these include accessing services
via journey CLIs, personal integrations and testing APIs etc..
