import React, { useState } from "react";
import { API } from "aws-amplify";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { onError } from "../lib/errorLib";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import "./PhotoDescribe.css";

export default function PhotoDescribe() {
  const nav = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function validateForm() {
    return selectedFile !== null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          
          const requestData = {
            image: base64Data,
            filename: selectedFile.name,
            contentType: selectedFile.type,
          };

          console.log("Sending request to describe-photo endpoint...");
          
          const response = await API.post("notes", "/describe-photo", {
            body: requestData,
          });
          
          console.log("Response received:", response);
          setResult(response);
          
        } catch (e) {
          console.error("Error calling API:", e);
          onError(e);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.readAsDataURL(selectedFile);
      
    } catch (e) {
      console.error("Error processing file:", e);
      onError(e);
      setIsLoading(false);
    }
  }

  function handleNewPhoto() {
    setSelectedFile(null);
    setImagePreview("");
    setResult(null);
  }

  return (
    <div className="PhotoDescribe">
      <h2>📸 AI Photo Describer</h2>
      <p className="text-muted">Upload a photo and let Claude 3.7 Sonnet describe it for you!</p>
      
      {!result ? (
        <Form onSubmit={handleSubmit}>
          <Stack gap={3}>
            <Form.Group controlId="photo">
              <Form.Label>Choose a photo:</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Form.Group>
            
            {imagePreview && (
              <Card>
                <Card.Header>Preview</Card.Header>
                <Card.Body>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </Card.Body>
              </Card>
            )}
            
            <LoaderButton
              size="lg"
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!validateForm()}
            >
              {isLoading ? "Claude 3.7 Sonnet analyzing..." : "Describe Photo with Claude 🤖"}
            </LoaderButton>
          </Stack>
        </Form>
      ) : (
        <div>
          <Alert variant="success">
            <Alert.Heading>✨ Claude 3.7 Sonnet Description!</Alert.Heading>
            <hr />
            <p><strong>Description:</strong> {result.description}</p>
            {result.usage && (
              <small className="text-muted">
                Tokens used: {result.usage.input_tokens} input, {result.usage.output_tokens} output 
                (Powered by Claude 3.7 Sonnet - Premium AI Vision)
              </small>
            )}
          </Alert>
          
          {result.imageUrl && (
            <Card className="mt-3">
              <Card.Header>Your Photo</Card.Header>
              <Card.Body>
                <img 
                  src={result.imageUrl} 
                  alt={result.description}
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
              </Card.Body>
            </Card>
          )}
          
          <Stack gap={2} className="mt-3">
            <LoaderButton
              size="lg"
              variant="primary"
              onClick={handleNewPhoto}
            >
              📸 Describe Another Photo
            </LoaderButton>
            <LoaderButton
              size="lg"
              variant="outline-secondary"
              onClick={() => nav("/")}
            >
              📝 Back to Notes
            </LoaderButton>
          </Stack>
        </div>
      )}
    </div>
  );
} 