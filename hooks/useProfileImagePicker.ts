import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';

export function useProfileImagePicker() {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (!user || uploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Necessary',
        'Allow access to the gallery to choose a photo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Error', 'Could not read the image');
      return;
    }

    try {
      setUploading(true);
      const mime = asset.mimeType ?? 'image/jpeg';
      await user.setProfileImage({
        file: `data:${mime};base64,${asset.base64}`,
      });
      await user.reload();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not update the photo, try again.');
    } finally {
      setUploading(false);
    }
  };

  return { pickImage, uploading };
}