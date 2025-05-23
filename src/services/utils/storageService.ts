
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const requiredBuckets = [
  'avatars',
  'documents',
  'products',
  'equipment',
  'gallery',
  'trainers',
  'workouts'
];

// Function to check if bucket exists
const bucketExists = async (name: string): Promise<boolean> => {
  try {
    // Instead of checking bucket metadata (which requires admin privileges),
    // just try to list files in the bucket which only requires anon access
    const { data, error } = await supabase
      .storage
      .from(name)
      .list();
    
    // If we can list files (even if empty), the bucket exists and is accessible
    return !error;
  } catch (error) {
    return false;
  }
};

// Function to check if a bucket is accessible and return basic info
const getBucketMetadata = async (name: string) => {
  try {
    // Try to list files in the bucket (this only requires anon access)
    const { data, error } = await supabase.storage.from(name).list('', {
      limit: 1, // Just get one file to minimize data transfer
      offset: 0,
    });
    
    if (error) {
      return null;
    }
    
    // Return a simplified metadata object
    return {
      name,
      id: name,
      public: true, // Assuming public access since we can list files
      createdAt: new Date().toISOString(),
      // We don't have actual metadata, but this is enough for most use cases
    };
  } catch (error) {
    return null;
  }
};

// Main function to verify storage buckets exist
export const ensureStorageBucketsExist = async (): Promise<void> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return;
    }
    
    // Check if buckets exist without trying to create them
    for (const bucket of requiredBuckets) {
      const exists = await bucketExists(bucket);
      if (!exists) {
        toast(`Storage bucket ${bucket} not accessible. Contact administrator.`, {
          description: "Some file upload features may not work correctly.",
          duration: 5000,
        });
      }
    }
  } catch (error) {
    // Error handled by toast notifications
  }
};

// Function to upload a file to storage
export const uploadFile = async (
  bucketName: string, 
  filePath: string, 
  file: File
): Promise<string | null> => {
  try {
    // Verify bucket exists
    const bucketMetadata = await getBucketMetadata(bucketName);
    if (!bucketMetadata) {
      toast.error(`Storage bucket ${bucketName} not found. Please contact admin.`);
      return null;
    }
    
    // Upload file
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type // Explicitly set content-type from file
      });
    
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error: any) {
    toast.error(`Error uploading file: ${error.message || 'Unknown error'}`);
    return null;
  }
};

// Function to delete a file from storage
export const deleteFile = async (
  bucketName: string,
  filePath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: any) {
    toast.error(`Error deleting file: ${error.message || 'Unknown error'}`);
    return false;
  }
};
