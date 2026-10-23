import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";

const MAX_ITEMS = 5;

export default function ImageUploadList() {
  const [images, setImages] = useState<string[]>([]);

  const data: (string | null)[] = Array.from(
    { length: MAX_ITEMS },
    (_, index) => images[index] ?? null
  );

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission necessary",
        "Allow the acess to the galery to add images."
      );
      return;
    }

    const remaining = MAX_ITEMS - images.length;

    if (remaining <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...uris].slice(0, MAX_ITEMS));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: string | null;
    index: number;
  }) => {
    if (item) {
      return (
        <View style={styles.card}>
          <Image source={{ uri: item }} style={styles.image} />
          <Pressable
            style={styles.removeButton}
            onPress={() => removeImage(index)}
            hitSlop={8}
          >
            <Feather name="x" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable style={[styles.card, styles.addCard]} onPress={pickImages}>
        <View style={styles.iconCircle}>
          <Feather name="upload-cloud" size={24} color="#4F3FB0" />
        </View>
        <Text style={styles.addText}>Add</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        horizontal
        keyExtractor={(_, index) => String(index)}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
  },
listContent: {
  paddingHorizontal: 24,
  paddingVertical: 12,
},
  separator: {
    width: 16,
  },
  card: {
    width: 140,
    height: 140,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#9CA8B8",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  addCard: {
    backgroundColor: "#FCFCFC",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EDEAF7",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    fontSize: 16,
    color: "#9A9AA5",
    fontFamily: 'Sen_400Regular'
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#00000099",
    alignItems: "center",
    justifyContent: "center",
  },
});