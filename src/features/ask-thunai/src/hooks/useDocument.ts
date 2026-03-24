import { useState, useCallback } from 'react';

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const useDocument = () => {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isDocumentVisible, setIsDocumentVisible] = useState(false);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);

  const createDocument = useCallback((title: string, content: string = '') => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentDocument(newDoc);
    setIsDocumentVisible(true);
    setAllDocuments(prev => [...prev, newDoc]);
    return newDoc;
  }, []);

  const updateDocument = useCallback((content: string) => {
    setCurrentDocument(prev => {
      if (!prev) return prev;
      const updatedDoc = { ...prev, content, updatedAt: new Date().toISOString() };
      setAllDocuments(docs =>
        docs.map(doc => (doc.id === updatedDoc.id ? updatedDoc : doc))
      );
      return updatedDoc;
    });
  }, []);

  const updateDocumentTitle = useCallback((title: string) => {
    setCurrentDocument(prev => {
      if (!prev) return prev;
      const updatedDoc = { ...prev, title, updatedAt: new Date().toISOString() };
      setAllDocuments(docs =>
        docs.map(doc => (doc.id === updatedDoc.id ? updatedDoc : doc))
      );
      return updatedDoc;
    });
  }, []);

  const closeDocument = useCallback(() => {
    setIsDocumentVisible(false);
  }, []);

  const showDocument = useCallback(() => {
    setIsDocumentVisible(true);
  }, []);

  const selectDocument = useCallback((document: Document) => {
    setCurrentDocument(document); // ensures `content` comes from selected doc
    setIsDocumentVisible(true);
  }, []);

  return {
    currentDocument,
    isDocumentVisible,
    allDocuments,
    createDocument,
    updateDocument,
    updateDocumentTitle,
    closeDocument,
    showDocument,
    selectDocument
  };
};