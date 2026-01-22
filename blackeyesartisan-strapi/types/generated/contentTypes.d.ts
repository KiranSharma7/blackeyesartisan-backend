import type { Schema, Struct } from '@strapi/strapi'

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files'
  info: {
    singularName: 'file'
    pluralName: 'files'
    displayName: 'File'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required
    alternativeText: Schema.Attribute.String
    caption: Schema.Attribute.String
    width: Schema.Attribute.Integer
    height: Schema.Attribute.Integer
    formats: Schema.Attribute.JSON
    hash: Schema.Attribute.String & Schema.Attribute.Required
    ext: Schema.Attribute.String
    mime: Schema.Attribute.String & Schema.Attribute.Required
    size: Schema.Attribute.Decimal & Schema.Attribute.Required
    url: Schema.Attribute.String & Schema.Attribute.Required
    previewUrl: Schema.Attribute.String
    provider: Schema.Attribute.String & Schema.Attribute.Required
    provider_metadata: Schema.Attribute.JSON
    related: Schema.Attribute.Relation
    folder: Schema.Attribute.Relation & Schema.Attribute.Private
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders'
  info: {
    singularName: 'folder'
    pluralName: 'folders'
    displayName: 'Folder'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique
    parent: Schema.Attribute.Relation
    children: Schema.Attribute.Relation
    files: Schema.Attribute.Relation
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale'
  info: {
    singularName: 'locale'
    pluralName: 'locales'
    collectionName: 'locales'
    displayName: 'Locale'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.SetMinMax
    code: Schema.Attribute.String & Schema.Attribute.Unique
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases'
  info: {
    singularName: 'release'
    pluralName: 'releases'
    displayName: 'Release'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required
    releasedAt: Schema.Attribute.DateTime
    scheduledAt: Schema.Attribute.DateTime
    timezone: Schema.Attribute.String
    status: Schema.Attribute.Enumeration & Schema.Attribute.Required
    actions: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions'
  info: {
    singularName: 'release-action'
    pluralName: 'release-actions'
    displayName: 'Release Action'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    type: Schema.Attribute.Enumeration & Schema.Attribute.Required
    contentType: Schema.Attribute.String & Schema.Attribute.Required
    entryDocumentId: Schema.Attribute.String
    locale: Schema.Attribute.String
    release: Schema.Attribute.Relation
    isEntryValid: Schema.Attribute.Boolean
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation
  }
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows'
  info: {
    name: 'Workflow'
    description: ''
    singularName: 'workflow'
    pluralName: 'workflows'
    displayName: 'Workflow'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique
    stages: Schema.Attribute.Relation
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages'
  info: {
    name: 'Workflow Stage'
    description: ''
    singularName: 'workflow-stage'
    pluralName: 'workflow-stages'
    displayName: 'Stages'
  }
  options: {
    version: '1.1.0'
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo
    workflow: Schema.Attribute.Relation
    permissions: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions'
  info: {
    name: 'permission'
    description: ''
    singularName: 'permission'
    pluralName: 'permissions'
    displayName: 'Permission'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required
    role: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles'
  info: {
    name: 'role'
    description: ''
    singularName: 'role'
    pluralName: 'roles'
    displayName: 'Role'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength
    description: Schema.Attribute.String
    type: Schema.Attribute.String & Schema.Attribute.Unique
    permissions: Schema.Attribute.Relation
    users: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users'
  info: {
    name: 'user'
    description: ''
    singularName: 'user'
    pluralName: 'users'
    displayName: 'User'
  }
  options: {
    timestamps: true
    draftAndPublish: false
  }
  attributes: {
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength
    provider: Schema.Attribute.String
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo
    role: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface ApiAboutUsAboutUs extends Struct.SingleTypeSchema {
  collectionName: 'about_uses'
  info: {
    singularName: 'about-us'
    pluralName: 'about-uses'
    displayName: 'About Us'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    Banner: Schema.Attribute.Media & Schema.Attribute.Required
    OurStory: Schema.Attribute.Component
    WhyUs: Schema.Attribute.Component
    OurCraftsmanship: Schema.Attribute.Component
    Numbers: Schema.Attribute.Component
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface ApiBlogBlog extends Struct.CollectionTypeSchema {
  collectionName: 'blogs'
  info: {
    singularName: 'blog'
    pluralName: 'blogs'
    displayName: 'Blog'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    Title: Schema.Attribute.String & Schema.Attribute.Required
    Slug: Schema.Attribute.UID
    Content: Schema.Attribute.RichText & Schema.Attribute.Required
    FeaturedImage: Schema.Attribute.Media & Schema.Attribute.Required
    Categories: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface ApiBlogPostCategoryBlogPostCategory
  extends Struct.CollectionTypeSchema {
  collectionName: 'blog_post_categories'
  info: {
    singularName: 'blog-post-category'
    pluralName: 'blog-post-categories'
    displayName: 'BlogPostCategories'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    Title: Schema.Attribute.String
    Slug: Schema.Attribute.UID
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface ApiCollectionCollection extends Struct.CollectionTypeSchema {
  collectionName: 'collections'
  info: {
    singularName: 'collection'
    pluralName: 'collections'
    displayName: 'Collections'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    Title: Schema.Attribute.String & Schema.Attribute.Required
    Handle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique
    Image: Schema.Attribute.Media & Schema.Attribute.Required
    Description: Schema.Attribute.Text & Schema.Attribute.Required
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface ApiFaqFaq extends Struct.SingleTypeSchema {
  collectionName: 'faqs'
  info: {
    singularName: 'faq'
    pluralName: 'faqs'
    displayName: 'FAQ'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    FAQSection: Schema.Attribute.Component
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface ApiHomepageHomepage extends Struct.SingleTypeSchema {
  collectionName: 'homepages'
  info: {
    singularName: 'homepage'
    pluralName: 'homepages'
    displayName: 'Homepage'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    HeroBanner: Schema.Attribute.Component
    MidBanner: Schema.Attribute.Component
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface ApiPrivacyPolicyPrivacyPolicy extends Struct.SingleTypeSchema {
  collectionName: 'privacy_policies'
  info: {
    singularName: 'privacy-policy'
    pluralName: 'privacy-policies'
    displayName: 'Privacy Policy'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    PageContent: Schema.Attribute.RichText
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface ApiProductVariantColorProductVariantColor
  extends Struct.CollectionTypeSchema {
  collectionName: 'product_variants_colors'
  info: {
    singularName: 'product-variant-color'
    pluralName: 'product-variants-colors'
    displayName: 'ProductVariantsColors'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    Name: Schema.Attribute.String & Schema.Attribute.Required
    Type: Schema.Attribute.DynamicZone
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface ApiTermsAndConditionTermsAndCondition
  extends Struct.SingleTypeSchema {
  collectionName: 'terms_and_conditions'
  info: {
    singularName: 'terms-and-condition'
    pluralName: 'terms-and-conditions'
    displayName: 'Terms & Conditions'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    PageContent: Schema.Attribute.RichText
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions'
  info: {
    name: 'Permission'
    description: ''
    singularName: 'permission'
    pluralName: 'permissions'
    displayName: 'Permission'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo
    subject: Schema.Attribute.String & Schema.Attribute.SetMinMaxLength
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo
    role: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users'
  info: {
    name: 'User'
    description: ''
    singularName: 'user'
    pluralName: 'users'
    displayName: 'User'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    firstname: Schema.Attribute.String & Schema.Attribute.SetMinMaxLength
    lastname: Schema.Attribute.String & Schema.Attribute.SetMinMaxLength
    username: Schema.Attribute.String
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo
    roles: Schema.Attribute.Relation & Schema.Attribute.Private
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo
    preferedLanguage: Schema.Attribute.String
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles'
  info: {
    name: 'Role'
    description: ''
    singularName: 'role'
    pluralName: 'roles'
    displayName: 'Role'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength
    description: Schema.Attribute.String
    users: Schema.Attribute.Relation
    permissions: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens'
  info: {
    name: 'Api Token'
    singularName: 'api-token'
    pluralName: 'api-tokens'
    displayName: 'Api Token'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength &
      Schema.Attribute.DefaultTo
    type: Schema.Attribute.Enumeration &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength
    lastUsedAt: Schema.Attribute.DateTime
    permissions: Schema.Attribute.Relation
    expiresAt: Schema.Attribute.DateTime
    lifespan: Schema.Attribute.BigInteger
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions'
  info: {
    name: 'API Token Permission'
    description: ''
    singularName: 'api-token-permission'
    pluralName: 'api-token-permissions'
    displayName: 'API Token Permission'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength
    token: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens'
  info: {
    name: 'Transfer Token'
    singularName: 'transfer-token'
    pluralName: 'transfer-tokens'
    displayName: 'Transfer Token'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength &
      Schema.Attribute.DefaultTo
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength
    lastUsedAt: Schema.Attribute.DateTime
    permissions: Schema.Attribute.Relation
    expiresAt: Schema.Attribute.DateTime
    lifespan: Schema.Attribute.BigInteger
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions'
  info: {
    name: 'Transfer Token Permission'
    description: ''
    singularName: 'transfer-token-permission'
    pluralName: 'transfer-token-permissions'
    displayName: 'Transfer Token Permission'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength
    token: Schema.Attribute.Relation
    createdAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    publishedAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation & Schema.Attribute.Private
    updatedBy: Schema.Attribute.Relation & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation
  }
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'plugin::upload.file': PluginUploadFile
      'plugin::upload.folder': PluginUploadFolder
      'plugin::i18n.locale': PluginI18NLocale
      'plugin::content-releases.release': PluginContentReleasesRelease
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission
      'plugin::users-permissions.role': PluginUsersPermissionsRole
      'plugin::users-permissions.user': PluginUsersPermissionsUser
      'api::about-us.about-us': ApiAboutUsAboutUs
      'api::blog.blog': ApiBlogBlog
      'api::blog-post-category.blog-post-category': ApiBlogPostCategoryBlogPostCategory
      'api::collection.collection': ApiCollectionCollection
      'api::faq.faq': ApiFaqFaq
      'api::homepage.homepage': ApiHomepageHomepage
      'api::privacy-policy.privacy-policy': ApiPrivacyPolicyPrivacyPolicy
      'api::product-variant-color.product-variant-color': ApiProductVariantColorProductVariantColor
      'api::terms-and-condition.terms-and-condition': ApiTermsAndConditionTermsAndCondition
      'admin::permission': AdminPermission
      'admin::user': AdminUser
      'admin::role': AdminRole
      'admin::api-token': AdminApiToken
      'admin::api-token-permission': AdminApiTokenPermission
      'admin::transfer-token': AdminTransferToken
      'admin::transfer-token-permission': AdminTransferTokenPermission
    }
  }
}
