import { AbstractFileProviderService } from '@medusajs/framework/utils';
import {
  FileTypes,
  Logger,
  ProviderFileResultDTO,
  ProviderUploadFileDTO
} from '@medusajs/framework/types';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

type InjectedDependencies = {
  logger: Logger;
};

type CloudinaryOptions = {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  secure?: boolean;
  upload_preset?: string;
  folder?: string;
};

/**
 * Cloudinary File Provider for Medusa 2.0
 *
 * Handles file uploads, deletions, and retrievals using Cloudinary's cloud storage.
 * Optimized for product images, documents, and other media assets.
 */
class CloudinaryFileProviderService extends AbstractFileProviderService {
  static identifier = 'cloudinary';

  protected logger_: Logger;
  protected options_: CloudinaryOptions;

  constructor({ logger }: InjectedDependencies, options: CloudinaryOptions) {
    super();

    this.logger_ = logger;
    this.options_ = options;

    // Validate required options
    if (!options.cloud_name || !options.api_key || !options.api_secret) {
      throw new Error(
        'Cloudinary File Provider requires cloud_name, api_key, and api_secret options'
      );
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: options.cloud_name,
      api_key: options.api_key,
      api_secret: options.api_secret,
      secure: options.secure ?? true
    });

    this.logger_.info('Cloudinary File Provider initialized successfully');
  }

  /**
   * Upload a file to Cloudinary
   *
   * @param file - File to upload with content buffer and metadata
   * @returns Uploaded file details with URL and public ID
   */
  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    try {
      const startTime = Date.now();

      // Convert buffer to base64 data URI for Cloudinary upload_stream
      const base64Data = `data:${file.mimetype || 'application/octet-stream'};base64,${file.content.toString('base64')}`;

      const uploadOptions: any = {
        folder: this.options_.folder || 'medusa',
        resource_type: 'auto', // Auto-detect resource type (image, video, raw)
        public_id: file.filename ? file.filename.replace(/\.[^/.]+$/, '') : undefined, // Remove extension
        overwrite: false,
        unique_filename: true
      };

      // Use upload_preset if configured
      if (this.options_.upload_preset) {
        uploadOptions.upload_preset = this.options_.upload_preset;
      }

      // Upload to Cloudinary
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        base64Data,
        uploadOptions
      );

      const duration = Date.now() - startTime;
      this.logger_.info(`File uploaded to Cloudinary in ${duration}ms`, {
        public_id: result.public_id,
        url: result.secure_url
      });

      return {
        url: result.secure_url, // HTTPS URL
        key: result.public_id // Cloudinary public ID (used for deletion)
      };
    } catch (error) {
      this.logger_.error('Failed to upload file to Cloudinary', {
        error: error instanceof Error ? error.message : error,
        filename: file.filename
      });
      throw error;
    }
  }

  /**
   * Delete one or more files from Cloudinary
   *
   * @param files - File(s) to delete with fileKey (public_id)
   */
  async delete(
    files: FileTypes.ProviderDeleteFileDTO | FileTypes.ProviderDeleteFileDTO[]
  ): Promise<void> {
    const fileArray = Array.isArray(files) ? files : [files];

    try {
      const deletePromises = fileArray.map(async (file) => {
        try {
          // Extract public_id from fileKey
          const publicId = file.fileKey;

          // Delete from Cloudinary
          const result = await cloudinary.uploader.destroy(publicId);

          if (result.result === 'ok') {
            this.logger_.info(`File deleted from Cloudinary`, { public_id: publicId });
          } else if (result.result === 'not found') {
            this.logger_.warn(`File not found in Cloudinary`, { public_id: publicId });
          } else {
            this.logger_.warn(`Unexpected deletion result from Cloudinary`, {
              public_id: publicId,
              result: result.result
            });
          }
        } catch (error) {
          this.logger_.error('Failed to delete file from Cloudinary', {
            error: error instanceof Error ? error.message : error,
            fileKey: file.fileKey
          });
          // Don't throw - continue with other deletions
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      this.logger_.error('Error during batch file deletion', {
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * Retrieve a file from Cloudinary as a buffer
   *
   * @param file - File details with fileKey (public_id)
   * @returns File buffer
   */
  async getAsBuffer(file: FileTypes.ProviderGetFileDTO): Promise<Buffer> {
    try {
      const publicId = file.fileKey;

      // Generate the Cloudinary URL for the original file
      const url = cloudinary.url(publicId, {
        resource_type: 'auto',
        secure: true
      });

      // Fetch the file from Cloudinary
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from Cloudinary: ${response.status} ${response.statusText}`
        );
      }

      // Convert response to buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      this.logger_.info(`File retrieved from Cloudinary as buffer`, {
        public_id: publicId,
        size: buffer.length
      });

      return buffer;
    } catch (error) {
      this.logger_.error('Failed to get file as buffer from Cloudinary', {
        error: error instanceof Error ? error.message : error,
        fileKey: file.fileKey
      });
      throw error;
    }
  }
}

export default CloudinaryFileProviderService;
