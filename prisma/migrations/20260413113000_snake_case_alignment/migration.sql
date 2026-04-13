-- Align Release 1 tables and columns to snake_case.

RENAME TABLE
  `Locale` TO `locale`,
  `User` TO `user`,
  `AdminSession` TO `admin_session`,
  `Equipment` TO `equipment`,
  `EquipmentAlias` TO `equipment_alias`,
  `Post` TO `post`,
  `PostTranslation` TO `post_translation`,
  `Category` TO `category`,
  `Tag` TO `tag`,
  `Manufacturer` TO `manufacturer`,
  `ManufacturerAlias` TO `manufacturer_alias`,
  `Model` TO `model`,
  `Fault` TO `fault`,
  `MaintenanceTask` TO `maintenance_task`,
  `MediaAsset` TO `media_asset`,
  `MediaVariant` TO `media_variant`,
  `SourceReference` TO `source_reference`,
  `Comment` TO `comment`,
  `CommentModerationEvent` TO `comment_moderation_event`,
  `GenerationJob` TO `generation_job`,
  `PromptTemplate` TO `prompt_template`,
  `SourceConfig` TO `source_config`,
  `ModelProviderConfig` TO `model_provider_config`,
  `SEORecord` TO `seo_record`,
  `ViewEvent` TO `view_event`,
  `AuditEvent` TO `audit_event`,
  `PostCategory` TO `post_category`,
  `PostTag` TO `post_tag`,
  `PostManufacturer` TO `post_manufacturer`;

ALTER TABLE `locale`
  RENAME COLUMN `isActive` TO `is_active`,
  RENAME COLUMN `isDefault` TO `is_default`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `user`
  RENAME COLUMN `passwordHash` TO `password_hash`,
  RENAME COLUMN `isActive` TO `is_active`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `admin_session`
  RENAME COLUMN `userId` TO `user_id`,
  RENAME COLUMN `tokenHash` TO `token_hash`,
  RENAME COLUMN `expiresAt` TO `expires_at`,
  RENAME COLUMN `invalidatedAt` TO `invalidated_at`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `lastUsedAt` TO `last_used_at`,
  RENAME COLUMN `userAgent` TO `user_agent`;

ALTER TABLE `equipment`
  RENAME COLUMN `normalizedName` TO `normalized_name`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `equipment_alias`
  RENAME COLUMN `equipmentId` TO `equipment_id`,
  RENAME COLUMN `normalizedAlias` TO `normalized_alias`;

ALTER TABLE `post`
  RENAME COLUMN `equipmentId` TO `equipment_id`,
  RENAME COLUMN `editorialStage` TO `editorial_stage`,
  RENAME COLUMN `featuredImageId` TO `featured_image_id`,
  RENAME COLUMN `authorId` TO `author_id`,
  RENAME COLUMN `scheduledPublishAt` TO `scheduled_publish_at`,
  RENAME COLUMN `publishedAt` TO `published_at`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `post_translation`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `contentMd` TO `content_md`,
  RENAME COLUMN `contentHtml` TO `content_html`,
  RENAME COLUMN `structuredContentJson` TO `structured_content_json`,
  RENAME COLUMN `faqJson` TO `faq_json`,
  RENAME COLUMN `isAutoTranslated` TO `is_auto_translated`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `manufacturer`
  RENAME COLUMN `normalizedName` TO `normalized_name`,
  RENAME COLUMN `primaryDomain` TO `primary_domain`,
  RENAME COLUMN `headquartersCountry` TO `headquarters_country`,
  RENAME COLUMN `branchCountriesJson` TO `branch_countries_json`,
  RENAME COLUMN `rankingScore` TO `ranking_score`;

ALTER TABLE `manufacturer_alias`
  RENAME COLUMN `manufacturerId` TO `manufacturer_id`,
  RENAME COLUMN `normalizedAlias` TO `normalized_alias`;

ALTER TABLE `model`
  RENAME COLUMN `manufacturerId` TO `manufacturer_id`,
  RENAME COLUMN `equipmentId` TO `equipment_id`,
  RENAME COLUMN `normalizedName` TO `normalized_name`,
  RENAME COLUMN `latestKnownYear` TO `latest_known_year`,
  RENAME COLUMN `rankingScore` TO `ranking_score`;

ALTER TABLE `fault`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `normalizedTitle` TO `normalized_title`,
  RENAME COLUMN `evidenceCount` TO `evidence_count`,
  RENAME COLUMN `sortOrder` TO `sort_order`;

ALTER TABLE `maintenance_task`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `sortOrder` TO `sort_order`;

ALTER TABLE `media_asset`
  RENAME COLUMN `fileName` TO `file_name`,
  RENAME COLUMN `fileSizeBytes` TO `file_size_bytes`,
  RENAME COLUMN `storageDriver` TO `storage_driver`,
  RENAME COLUMN `storageKey` TO `storage_key`,
  RENAME COLUMN `publicUrl` TO `public_url`,
  RENAME COLUMN `localPath` TO `local_path`,
  RENAME COLUMN `sourceUrl` TO `source_url`,
  RENAME COLUMN `sourceDomain` TO `source_domain`,
  RENAME COLUMN `mimeType` TO `mime_type`,
  RENAME COLUMN `attributionText` TO `attribution_text`,
  RENAME COLUMN `licenseType` TO `license_type`,
  RENAME COLUMN `usageNotes` TO `usage_notes`,
  RENAME COLUMN `isAiGenerated` TO `is_ai_generated`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `media_variant`
  RENAME COLUMN `mediaAssetId` TO `media_asset_id`,
  RENAME COLUMN `variantKey` TO `variant_key`,
  RENAME COLUMN `mimeType` TO `mime_type`,
  RENAME COLUMN `fileSizeBytes` TO `file_size_bytes`,
  RENAME COLUMN `storageKey` TO `storage_key`,
  RENAME COLUMN `publicUrl` TO `public_url`,
  RENAME COLUMN `localPath` TO `local_path`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `source_reference`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `equipmentId` TO `equipment_id`,
  RENAME COLUMN `manufacturerId` TO `manufacturer_id`,
  RENAME COLUMN `modelId` TO `model_id`,
  RENAME COLUMN `sourceDomain` TO `source_domain`,
  RENAME COLUMN `sourceType` TO `source_type`,
  RENAME COLUMN `fileType` TO `file_type`,
  RENAME COLUMN `accessStatus` TO `access_status`,
  RENAME COLUMN `reliabilityTier` TO `reliability_tier`,
  RENAME COLUMN `lastCheckedAt` TO `last_checked_at`;

ALTER TABLE `comment`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `parentId` TO `parent_id`,
  RENAME COLUMN `ipHash` TO `ip_hash`,
  RENAME COLUMN `userAgent` TO `user_agent`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `comment_moderation_event`
  RENAME COLUMN `commentId` TO `comment_id`,
  RENAME COLUMN `actorId` TO `actor_id`,
  RENAME COLUMN `createdAt` TO `created_at`;

ALTER TABLE `generation_job`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `equipmentName` TO `equipment_name`,
  RENAME COLUMN `providerConfigId` TO `provider_config_id`,
  RENAME COLUMN `currentStage` TO `current_stage`,
  RENAME COLUMN `requestJson` TO `request_json`,
  RENAME COLUMN `responseJson` TO `response_json`,
  RENAME COLUMN `warningJson` TO `warning_json`,
  RENAME COLUMN `errorMessage` TO `error_message`,
  RENAME COLUMN `replaceExistingPost` TO `replace_existing_post`,
  RENAME COLUMN `schedulePublishAt` TO `schedule_publish_at`,
  RENAME COLUMN `startedAt` TO `started_at`,
  RENAME COLUMN `finishedAt` TO `finished_at`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `prompt_template`
  RENAME COLUMN `systemPrompt` TO `system_prompt`,
  RENAME COLUMN `userPromptTemplate` TO `user_prompt_template`,
  RENAME COLUMN `isActive` TO `is_active`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `source_config`
  RENAME COLUMN `sourceType` TO `source_type`,
  RENAME COLUMN `isEnabled` TO `is_enabled`,
  RENAME COLUMN `allowedDomainsJson` TO `allowed_domains_json`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `model_provider_config`
  RENAME COLUMN `apiKeyEnvName` TO `api_key_env_name`,
  RENAME COLUMN `apiKeyEncrypted` TO `api_key_encrypted`,
  RENAME COLUMN `apiKeyLast4` TO `api_key_last4`,
  RENAME COLUMN `apiKeyUpdatedAt` TO `api_key_updated_at`,
  RENAME COLUMN `isDefault` TO `is_default`,
  RENAME COLUMN `isEnabled` TO `is_enabled`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `seo_record`
  RENAME COLUMN `postTranslationId` TO `post_translation_id`,
  RENAME COLUMN `canonicalUrl` TO `canonical_url`,
  RENAME COLUMN `metaTitle` TO `meta_title`,
  RENAME COLUMN `metaDescription` TO `meta_description`,
  RENAME COLUMN `ogTitle` TO `og_title`,
  RENAME COLUMN `ogDescription` TO `og_description`,
  RENAME COLUMN `ogImageId` TO `og_image_id`,
  RENAME COLUMN `twitterTitle` TO `twitter_title`,
  RENAME COLUMN `twitterDescription` TO `twitter_description`,
  RENAME COLUMN `keywordsJson` TO `keywords_json`,
  RENAME COLUMN `authorsJson` TO `authors_json`,
  RENAME COLUMN `createdAt` TO `created_at`,
  RENAME COLUMN `updatedAt` TO `updated_at`;

ALTER TABLE `view_event`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `eventType` TO `event_type`,
  RENAME COLUMN `ipHash` TO `ip_hash`,
  RENAME COLUMN `userAgent` TO `user_agent`,
  RENAME COLUMN `createdAt` TO `created_at`;

ALTER TABLE `audit_event`
  RENAME COLUMN `actorId` TO `actor_id`,
  RENAME COLUMN `entityType` TO `entity_type`,
  RENAME COLUMN `entityId` TO `entity_id`,
  RENAME COLUMN `payloadJson` TO `payload_json`,
  RENAME COLUMN `createdAt` TO `created_at`;

ALTER TABLE `post_category`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `categoryId` TO `category_id`;

ALTER TABLE `post_tag`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `tagId` TO `tag_id`;

ALTER TABLE `post_manufacturer`
  RENAME COLUMN `postId` TO `post_id`,
  RENAME COLUMN `manufacturerId` TO `manufacturer_id`;

ALTER TABLE `equipment`
  ADD COLUMN `lifecycle_status` ENUM('PLANNED', 'DRAFT', 'GENERATED', 'EDITED', 'UPDATED', 'POSTED') NOT NULL DEFAULT 'PLANNED',
  ADD COLUMN `lifecycle_notes` LONGTEXT NULL,
  ADD COLUMN `posted_at` DATETIME(3) NULL;

CREATE INDEX `equipment_lifecycle_status_idx` ON `equipment`(`lifecycle_status`);
