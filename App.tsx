import React, { useState } from "react";
import { View, Alert, StyleSheet, ScrollView } from "react-native";
import {
  Button,
  TextInput,
  Text,
  Card,
  Title,
  Paragraph,
} from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null
  );
  const [fileId, setFileId] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const fileData = res.assets[0];
        setFile(fileData);
        console.log("Selected file:", fileData);
      } else {
        console.log("File selection was canceled or no file was selected.");
      }
    } catch (err) {
      console.warn("Error picking document: ", err);
    }
  };

  const uploadFile = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any);

      console.log("Uploading file:", file);

      try {
        const res = await axios.post(
          "https://pdf-uploader-backend.onrender.com/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setFileId(res.data.fileId);
        console.log("File uploaded, fileId:", res.data.fileId);
        Alert.alert("File uploaded successfully!");
      } catch (err) {
        console.error("Error uploading file:", err);
        Alert.alert("Upload failed", "Could not upload the file.");
      }
    } else {
      Alert.alert("No file selected", "Please select a file to upload.");
    }
  };

  const askQuestion = async () => {
    if (!fileId) {
      Alert.alert("No file uploaded", "Please upload a PDF file.");
      return;
    }
    if (!question.trim()) {
      Alert.alert("Empty question", "Please enter a question.");
      return;
    }

    console.log("Asking question:", question);
    console.log("Asking question for fileId:", fileId);
    try {
      const res = await axios.get(`http://192.168.224.17:5000/ask/${fileId}`, {
        params: { question },
      });
      setAnswer(res.data.answer);
      console.log("Answer received:", res.data.answer);
    } catch (err) {
      console.error("Error retrieving answer:", err);
      Alert.alert("Error", "Could not retrieve the answer.");
    }
  };

  const resetFields = () => {
    setFile(null);
    setFileId("");
    setQuestion("");
    setAnswer("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.uploaderText}>PDF Uploader</Text>
        <Card.Content>
          <Title>
            {file
              ? fileId
                ? `PDF: ${file.name}`
                : "Upload a PDF file and ask your question."
              : "Select a PDF file and ask your question."}
          </Title>
          <Paragraph>
            {fileId ? "You can now ask your question." : ""}
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={selectFile} style={styles.button}>
            Select PDF
          </Button>
          <Button
            mode="contained"
            onPress={uploadFile}
            disabled={!file}
            style={styles.button}
          >
            Upload PDF
          </Button>
          <Button mode="outlined" onPress={resetFields} style={styles.button}>
            Reset
          </Button>
        </Card.Actions>
      </Card>
      <TextInput
        placeholder="Ask a question..."
        value={question}
        onChangeText={setQuestion}
        style={styles.input}
        mode="outlined"
      />
      <Button
        mode="contained"
        onPress={askQuestion}
        disabled={!fileId}
        style={styles.button}
      >
        Ask
      </Button>
      {answer ? <Text style={styles.answer}>Answer: {answer}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  card: {
    width: "100%",
    marginBottom: 20,
  },
  uploaderText: {
    fontSize: 30,
    textAlign: "center",
    margin: 20,
    fontWeight: "bold",
  },
  button: {},
  input: {
    width: "100%",
    marginBottom: 10,
  },
  answer: {
    marginTop: 10,
    fontSize: 16,
    color: "blue",
  },
});
