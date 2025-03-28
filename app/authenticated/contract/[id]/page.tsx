"use client";

import React, { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Download, Eye, FileText, Mail, Upload } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink, 
  Image 
} from '@react-pdf/renderer';
import { useRouter } from "next/router";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Define PDF styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  signatureSection: {
    flexDirection: 'row',
    marginTop: 30,
  },
  signatureBlock: {
    width: '50%',
    marginTop: 10,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'dashed',
    marginTop: 30,
    marginBottom: 5,
    width: '80%',
  },
  signatureImage: {
    height: 50,
    marginBottom: 5,
    width: 'auto',
  },
  bold: {
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  preWrapped: {
    fontSize: 12,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: 'center',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
  },
  tableHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

// Helper function to get initials for both regular and PDF component
const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name[0]?.toUpperCase() || "";
};

// Define FormData interface
interface ContractFormData {
  contractTitle: string;
  contractorName: string;
  contractorCompany: string;
  clientName: string;
  clientNameInitials: string;
  clientAddress: string;
  startDate: Date;
  endDate: Date;
  paymentAmount: string;
  paymentTerms: string;
  scope: string;
  termsAndConditions: string;
  additionalNotes?: string;
  signatureImage: string | null;
  contractorSignature: string | null;
  proposalCategories: Category[];
  proposalVariables: Variable[];
  contractorInitials: string;
}

// Define Category and Element interfaces
interface Element {
  name: string;
  material_cost: number;
  labor_cost: number;
}

interface Category {
  id: number;
  name: string;
  elements: Element[];
}

interface Variable {
  id: number;
  name: string;
  category: string;
  value: number;
}

// Define the PDF Document component
const ContractDocument = ({ formData }: { formData: ContractFormData }) => {
  const formatPdfDate = (date: Date) => {
    return format(date, "MMMM d, yyyy");
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>{formData.contractTitle}</Text>
        
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.text}>
            This Service Agreement (the "Agreement") is entered into as of {formatPdfDate(formData.startDate)} by and between:
          </Text>
        </View>
        
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.text}>
            <Text style={pdfStyles.bold}>{formData.contractorName}</Text> of{" "}
            <Text style={pdfStyles.bold}>{formData.contractorCompany}</Text> (the "Contractor"), and
          </Text>
          <Text style={pdfStyles.text}>
            <Text style={pdfStyles.bold}>{formData.clientName}</Text>, located at{" "}
            {formData.clientAddress} (the "Client").
          </Text>
        </View>
        
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>1. TERM</Text>
          <Text style={pdfStyles.text}>
            This Agreement shall commence on {formatPdfDate(formData.startDate)} and continue until{" "}
            {formatPdfDate(formData.endDate)}, unless terminated earlier pursuant to the terms of this Agreement.
          </Text>
        </View>
        
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>2. SCOPE OF WORK</Text>
          <Text style={pdfStyles.text}>{formData.scope}</Text>
        </View>
        
        {formData.proposalCategories && formData.proposalCategories.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>3. PROJECT CATEGORIES AND ELEMENTS</Text>
            {formData.proposalCategories.map((category, catIndex) => (
              <View key={catIndex} style={{ marginBottom: 10 }}>
                <Text style={[pdfStyles.text, pdfStyles.bold, { marginBottom: 5 }]}>{category.name}</Text>
                <View style={pdfStyles.table}>
                  {/* Table Header */}
                  <View style={pdfStyles.tableRow}>
                    <View style={[pdfStyles.tableCol, { width: '40%' }]}>
                      <Text style={pdfStyles.tableHeader}>Element</Text>
                    </View>
                    <View style={[pdfStyles.tableCol, { width: '20%' }]}>
                      <Text style={pdfStyles.tableHeader}>Material Cost</Text>
                    </View>
                    <View style={[pdfStyles.tableCol, { width: '20%' }]}>
                      <Text style={pdfStyles.tableHeader}>Labor Cost</Text>
                    </View>
                    <View style={[pdfStyles.tableCol, { width: '20%' }]}>
                      <Text style={pdfStyles.tableHeader}>Total</Text>
                    </View>
                  </View>
                  
                  {/* Table Rows */}
                  {category.elements.map((element, elemIndex) => {
                    const total = element.material_cost + element.labor_cost;
                    return (
                      <View key={elemIndex} style={pdfStyles.tableRow}>
                        <View style={[pdfStyles.tableCol, { width: '40%' }]}>
                          <Text style={pdfStyles.tableCell}>{element.name}</Text>
                        </View>
                        <View style={[pdfStyles.tableCol, { width: '20%' }]}>
                          <Text style={pdfStyles.tableCell}>${element.material_cost.toFixed(2)}</Text>
                        </View>
                        <View style={[pdfStyles.tableCol, { width: '20%' }]}>
                          <Text style={pdfStyles.tableCell}>${element.labor_cost.toFixed(2)}</Text>
                        </View>
                        <View style={[pdfStyles.tableCol, { width: '20%' }]}>
                          <Text style={pdfStyles.tableCell}>${total.toFixed(2)}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
        
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>{formData.proposalCategories?.length > 0 ? "4" : "3"}. COMPENSATION</Text>
          <Text style={pdfStyles.text}>
            Client agrees to pay Contractor {formData.paymentAmount} for the services rendered. Payment terms:{" "}
            {formData.paymentTerms}.
          </Text>
        </View>
        
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>{formData.proposalCategories?.length > 0 ? "5" : "4"}. TERMS AND CONDITIONS</Text>
          <Text style={pdfStyles.text}>{formData.termsAndConditions}</Text>
        </View>
        
        {formData.additionalNotes && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>{formData.proposalCategories?.length > 0 ? "6" : "5"}. ADDITIONAL NOTES</Text>
            <Text style={pdfStyles.text}>{formData.additionalNotes}</Text>
          </View>
        )}
        
        {formData.proposalVariables && formData.proposalVariables.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.heading}>
              {formData.proposalCategories?.length > 0 
                ? (formData.additionalNotes ? "7" : "6") 
                : (formData.additionalNotes ? "6" : "5")}. VARIABLES
            </Text>
            <View>
              {/* Group variables by category */}
              {['Linear Feet', 'Square Feet', 'Cubic Feet', 'Count'].map(category => {
                const categoryVariables = formData.proposalVariables.filter(v => v.category === category);
                if (categoryVariables.length === 0) return null;
                
                return (
                  <View key={category} style={{ marginBottom: 10 }}>
                    <Text style={[pdfStyles.text, pdfStyles.bold, { marginBottom: 5 }]}>{category}</Text>
                    <View style={pdfStyles.table}>
                      {/* Table Header */}
                      <View style={pdfStyles.tableRow}>
                        <View style={[pdfStyles.tableCol, { width: '60%' }]}>
                          <Text style={pdfStyles.tableHeader}>Variable</Text>
                        </View>
                        <View style={[pdfStyles.tableCol, { width: '40%' }]}>
                          <Text style={pdfStyles.tableHeader}>Value</Text>
                        </View>
                      </View>
                      
                      {/* Table Rows */}
                      {categoryVariables.map((variable, varIndex) => (
                        <View key={varIndex} style={pdfStyles.tableRow}>
                          <View style={[pdfStyles.tableCol, { width: '60%' }]}>
                            <Text style={pdfStyles.tableCell}>{variable.name}</Text>
                          </View>
                          <View style={[pdfStyles.tableCol, { width: '40%' }]}>
                            <Text style={pdfStyles.tableCell}>{variable.value}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        
        <View style={pdfStyles.signatureSection}>
          <View style={pdfStyles.signatureBlock}>
            <Text style={pdfStyles.bold}>CONTRACTOR:</Text>
            {formData.contractorSignature ? (
              <Image
                src={formData.contractorSignature}
                style={pdfStyles.signatureImage}
              />
            ) : (
              <View style={pdfStyles.signatureLine} />
            )}
            <Text style={pdfStyles.text}>{formData.contractorName}</Text>
            <Text style={pdfStyles.text}>{formData.contractorCompany}</Text>
            <Text style={pdfStyles.text}>
              Initials: {formData.contractorInitials || getInitials(formData.contractorName)}
            </Text>
            <Text style={pdfStyles.text}>
              Date: {format(new Date(), "MMMM d, yyyy")}
            </Text>
          </View>
          
          <View style={pdfStyles.signatureBlock}>
            <Text style={pdfStyles.bold}>CLIENT:</Text>
            {formData.signatureImage ? (
              <Image
                src={formData.signatureImage}
                style={pdfStyles.signatureImage}
              />
            ) : (
              <View style={pdfStyles.signatureLine} />
            )}
            <Text style={pdfStyles.text}>{formData.clientName}</Text>
            <Text style={pdfStyles.text}>Authorized Representative</Text>
            <Text style={pdfStyles.text}>
              Initials: {formData.clientNameInitials}
            </Text>
            <Text style={pdfStyles.text}>
              Date: {format(new Date(), "MMMM d, yyyy")}
            </Text>
          </View>
        </View>

        <Text style={pdfStyles.footer}>
          Document generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
        </Text>
      </Page>
    </Document>
  );
};

export default function ContractViewer({ params }: PageProps) {
  const unwrappedParams = React.use(params) as { id: string };
  const { id } = unwrappedParams;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [formData, setFormData] = useState({
    contractTitle: "",
    contractorName: "",
    contractorCompany: "",
    clientName: "",
    clientNameInitials: "",
    clientAddress: "",
    startDate: new Date(),
    endDate: new Date(),
    paymentAmount: "",
    paymentTerms: "",
    scope: "",
    termsAndConditions: "",
    additionalNotes: "",
    signatureImage: null as string | null,
    contractorSignature: null as string | null,
    proposalCategories: [] as Category[],
    proposalVariables: [] as Variable[],
    contractorInitials: "",
    client_email: "",
  });

  useEffect(() => {
    const fetchContractData = async () => {
      if (!id) return;
      try {
        const response = await fetch(`${API_URL}/contracts/${id}`);
        if (!response.ok) throw new Error("Failed to fetch contract");
        const data = await response.json();
        
        // Get the proposal data to access categories and elements
        let proposalCategories = [];
        let proposalVariables = [];
        
        if (data.proposal && data.proposal.id) {
          try {
            const proposalResponse = await fetch(`${API_URL}/proposals/${data.proposal.id}`);
            if (proposalResponse.ok) {
              const proposalData = await proposalResponse.json();
              proposalCategories = proposalData.proposal_categories || [];
              proposalVariables = proposalData.proposal_variables || [];
            }
          } catch (error) {
            console.error("Error fetching proposal details:", error);
          }
        }
        
        setFormData((prevData) => ({
          ...prevData,
          ...data,
          termsAndConditions: data.terms_and_conditions,
          contractTitle: data.contract_title,
          contractorName: data.contractor_name,
          scope: data.scope,
          contractorCompany: data.contractor_company,
          paymentTerms: data.payment_terms,
          paymentAmount: data.payment_amount,
          clientName: data.proposal.client_name,
          clientNameInitials: data.client_name_initials,
          clientAddress: data.client_address,
          startDate: new Date(data.start_date),
          endDate: new Date(data.end_date),
          signatureImage: data.client_signature,
          proposalCategories: proposalCategories,
          proposalVariables: proposalVariables,
          client_email: data.proposal.client_email,
          contractorSignature: data.contractor_signature,
        }));
      } catch (error) {
        console.error("Error fetching contract:", error);
      }
    };

    fetchContractData();
  }, [id, API_URL]);



  const sendEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/send-email?email=${encodeURIComponent(formData.client_email)}&contract_id=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    }
  };


  const formatDate = (date: Date) => {
    return format(date, "MMMM d, yyyy");
  };

  const uploadContractorSignature = async () => {
    if (!formData.contractorSignature || !id) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Create a FormData object to send the image
      const formDataToSend = new FormData();

      // Convert the base64 string to a blob
      const base64Response = await fetch(formData.contractorSignature);
      const blob = await base64Response.blob();

      // Add the file to the FormData
      formDataToSend.append("signature", blob, "signature.png");
      
      // Add contractor initials if available
      if (formData.contractorInitials) {
        formDataToSend.append("contractor_initials", formData.contractorInitials);
      }

      // Send the request to the server
      const response = await fetch(
        `${API_URL}/contracts/${id}/contractor_upload_signature`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload signature");
      }

      setUploadSuccess(true);
    } catch (error) {
      console.error("Error uploading signature:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload signature"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const uploadSignature = async () => {
    if (!formData.signatureImage || !id) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Create a FormData object to send the image
      const formDataToSend = new FormData();

      // Convert the base64 string to a blob
      const base64Response = await fetch(formData.signatureImage);
      const blob = await base64Response.blob();

      // Add the file to the FormData
      formDataToSend.append("signature", blob, "signature.png");

      // Send the request to the server
      const response = await fetch(
        `${API_URL}/contracts/${id}/client_upload_signature`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload signature");
      }

      setUploadSuccess(true);
    } catch (error) {
      console.error("Error uploading signature:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload signature"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Custom button for PDF download that handles loading state outside of PDFDownloadLink
  const PdfDownloadButton = ({ children, fileName, className }: { children: React.ReactNode; fileName: string; className: string }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    
    return (
      <div className={className}>
        <PDFDownloadLink
          document={<ContractDocument formData={formData} />}
          fileName={fileName}
          className={isDownloading ? "pointer-events-none" : ""}
        >
          {({ blob, url, loading, error }) => {
            // When the blob starts loading, or there's an error, update our state
            if (loading !== isDownloading) {
              setIsDownloading(loading);
            }
            
            return (
              <Button disabled={isDownloading}>
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Generating PDF..." : children}
              </Button>
            );
          }}
        </PDFDownloadLink>
      </div>
    );
  };

  const PdfSmallDownloadButton = ({ children, fileName, className }: { children: React.ReactNode; fileName: string; className: string }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    
    return (
      <div className={className}>
        <PDFDownloadLink
          document={<ContractDocument formData={formData} />}
          fileName={fileName}
          className={isDownloading ? "pointer-events-none" : ""}
        >
          {({ blob, url, loading, error }) => {
            // When the blob starts loading, or there's an error, update our state
            if (loading !== isDownloading) {
              setIsDownloading(loading);
            }
            
            return (
              <Button size="sm" disabled={isDownloading}>
                <Download className="mr-2 h-3 w-3" />
                {isDownloading ? "Generating..." : children}
              </Button>
            );
          }}
        </PDFDownloadLink>
      </div>
    );
  };

  return (
    <main className="flex-1 p-6 lg:p-8 bg-muted/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Contract Details
          </h1>
          <p className="text-muted-foreground mt-1">
            View contract information
          </p>
        </div>
        <div>
          <Button onClick={sendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Send Contract to Client
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Section */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
              <CardDescription>Contract information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-title">Contract Title</Label>
                <Input
                  id="contract-title"
                  value={formData.contractTitle}
                  disabled
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contractor-name">Contractor Name</Label>
                  <Input
                    id="contractor-name"
                    value={formData.contractorName}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractor-company">Contractor Company</Label>
                  <Input
                    id="contractor-company"
                    value={formData.contractorCompany}
                    disabled
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={formData.clientName}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-address">Client Address</Label>
                  <Input
                    id="client-address"
                    value={formData.clientAddress}
                    disabled
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input value={format(formData.startDate, "PPP")} disabled />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input value={format(formData.endDate, "PPP")} disabled />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Payment Amount</Label>
                  <Input
                    id="payment-amount"
                    value={formData.paymentAmount}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-terms">Payment Terms</Label>
                  <Input
                    id="payment-terms"
                    value={formData.paymentTerms}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Scope & Terms</CardTitle>
              <CardDescription>
                Contract scope and terms details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scope">Scope of Work</Label>
                <Textarea id="scope" rows={4} value={formData.scope} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  rows={10}
                  value={formData.termsAndConditions}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.additionalNotes}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Signature Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Client Signature</CardTitle>
              <CardDescription>Upload client signature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Client Signature</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData((prev) => ({
                              ...prev,
                              signatureImage: reader.result as string,
                            }));
                            // Reset upload status when a new file is selected
                            setUploadSuccess(false);
                            setUploadError(null);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {formData.signatureImage && (
                    <div className="mt-2 border rounded-md p-2">
                      <img
                        src={formData.signatureImage}
                        alt="Client Signature"
                        className="max-h-20"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Client Initials</Label>
                  <Input 
                    value={formData.clientNameInitials} 
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        clientNameInitials: e.target.value
                      }))
                    }
                  />
                </div>
              </div>
              {uploadSuccess && (
                <p className="text-sm text-green-500 mt-1">
                  Signature uploaded successfully!
                </p>
              )}
              {uploadError && (
                <p className="text-sm text-red-500 mt-1">
                  Error: {uploadError}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={uploadSignature}
                  disabled={!formData.signatureImage || isUploading}
                  size="sm"
                >
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Upload Client Signature
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contractor Signature Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Contractor Signature</CardTitle>
              <CardDescription>Upload contractor signature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Contractor Signature</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData((prev) => ({
                              ...prev,
                              contractorSignature: reader.result as string,
                            }));
                            // Reset upload status when a new file is selected
                            setUploadSuccess(false);
                            setUploadError(null);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {formData.contractorSignature && (
                    <div className="mt-2 border rounded-md p-2">
                      <img
                        src={formData.contractorSignature}
                        alt="Contractor Signature"
                        className="max-h-20"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Contractor Initials</Label>
                  <Input 
                    value={formData.contractorInitials} 
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        contractorInitials: e.target.value
                      }))
                    }
                  />
                </div>
              </div>
              {uploadSuccess && (
                <p className="text-sm text-green-500 mt-1">
                  Signature uploaded successfully!
                </p>
              )}
              {uploadError && (
                <p className="text-sm text-red-500 mt-1">
                  Error: {uploadError}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={uploadContractorSignature}
                  disabled={!formData.contractorSignature || isUploading}
                  size="sm"
                >
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Upload Contractor Signature
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Contract Preview</CardTitle>
                <CardDescription>
                  Preview how your contract appears
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Full Screen
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md shadow-sm">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {formData.contractTitle}.pdf
                    </span>
                  </div>
                  <PdfSmallDownloadButton 
                    fileName={`${formData.contractTitle || 'Contract'}.pdf`}
                    className=""
                  >
                    Download
                  </PdfSmallDownloadButton>
                </div>

                <div 
                  className="contract-content p-8 min-h-[800px] max-h-[800px] overflow-auto prose dark:prose-invert max-w-none bg-white text-black"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">
                      {formData.contractTitle}
                    </h1>
                  </div>

                  <p>
                    This Service Agreement (the "Agreement") is entered into as
                    of {formatDate(formData.startDate)} by and between:
                  </p>

                  <div className="my-4">
                    <p>
                      <strong>{formData.contractorName}</strong> of{" "}
                      <strong>{formData.contractorCompany}</strong> (the
                      "Contractor"), and
                    </p>
                    <p>
                      <strong>{formData.clientName}</strong>, located at{" "}
                      {formData.clientAddress} (the "Client").
                    </p>
                  </div>

                  <h2 className="text-xl font-semibold mt-6">1. TERM</h2>
                  <p>
                    This Agreement shall commence on{" "}
                    {formatDate(formData.startDate)} and continue until{" "}
                    {formatDate(formData.endDate)}, unless terminated earlier
                    pursuant to the terms of this Agreement.
                  </p>

                  <h2 className="text-xl font-semibold mt-6">
                    2. SCOPE OF WORK
                  </h2>
                  <p>{formData.scope}</p>

                  {formData.proposalCategories && formData.proposalCategories.length > 0 && (
                    <>
                      <h2 className="text-xl font-semibold mt-6">
                        3. PROJECT CATEGORIES AND ELEMENTS
                      </h2>
                      {formData.proposalCategories.map((category, catIndex) => (
                        <div key={catIndex} className="mb-4">
                          <p className="font-semibold">{category.name}</p>
                          <table className="min-w-full border-collapse border border-gray-300 mt-2 mb-4">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-3 py-1 text-left w-1/3">Element</th>
                                <th className="border border-gray-300 px-3 py-1 text-left">Material Cost</th>
                                <th className="border border-gray-300 px-3 py-1 text-left">Labor Cost</th>
                                <th className="border border-gray-300 px-3 py-1 text-left">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {category.elements.map((element, elemIndex) => {
                                const total = element.material_cost + element.labor_cost;
                                return (
                                  <tr key={elemIndex} className={elemIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="border border-gray-300 px-3 py-1">{element.name}</td>
                                    <td className="border border-gray-300 px-3 py-1">${element.material_cost.toFixed(2)}</td>
                                    <td className="border border-gray-300 px-3 py-1">${element.labor_cost.toFixed(2)}</td>
                                    <td className="border border-gray-300 px-3 py-1">${total.toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </>
                  )}

                  <h2 className="text-xl font-semibold mt-6">
                    {formData.proposalCategories?.length > 0 ? "4" : "3"}. COMPENSATION
                  </h2>
                  <p>
                    Client agrees to pay Contractor {formData.paymentAmount} for
                    the services rendered. Payment terms:{" "}
                    {formData.paymentTerms}.
                  </p>

                  <h2 className="text-xl font-semibold mt-6">
                    {formData.proposalCategories?.length > 0 ? "5" : "4"}. TERMS AND CONDITIONS
                  </h2>
                  <div className="whitespace-pre-line">
                    {formData.termsAndConditions}
                  </div>

                  {formData.additionalNotes && (
                    <>
                      <h2 className="text-xl font-semibold mt-6">
                        {formData.proposalCategories?.length > 0 ? "6" : "5"}. ADDITIONAL NOTES
                      </h2>
                      <p>{formData.additionalNotes}</p>
                    </>
                  )}

                  {formData.proposalVariables && formData.proposalVariables.length > 0 && (
                    <>
                      <h2 className="text-xl font-semibold mt-6">
                        {formData.proposalCategories?.length > 0 ? (formData.additionalNotes ? "7" : "6") : (formData.additionalNotes ? "6" : "5")}. VARIABLES
                      </h2>
                      <div>
                        {['Linear Feet', 'Square Feet', 'Cubic Feet', 'Count'].map(category => {
                          const categoryVariables = formData.proposalVariables.filter(v => v.category === category);
                          if (categoryVariables.length === 0) return null;
                          
                          return (
                            <div key={category} className="mb-4">
                              <p className="font-semibold">{category}</p>
                              <table className="min-w-full border-collapse border border-gray-300 mt-2 mb-4">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-3 py-1 text-left w-2/3">Variable</th>
                                    <th className="border border-gray-300 px-3 py-1 text-left w-1/3">Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {categoryVariables.map((variable, varIndex) => (
                                    <tr key={varIndex} className={varIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                      <td className="border border-gray-300 px-3 py-1">{variable.name}</td>
                                      <td className="border border-gray-300 px-3 py-1">{variable.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <div className="mt-10 grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-semibold">CONTRACTOR:</p>
                      {formData.contractorSignature ? (
                        <div className="mt-4">
                          <img
                            src={formData.contractorSignature}
                            alt="Contractor signature"
                            className="max-h-16 mb-2"
                          />
                        </div>
                      ) : (
                        <div className="mt-6 border-b border-dashed border-gray-400 pt-6"></div>
                      )}
                      <p className="mt-2">{formData.contractorName}</p>
                      <p>{formData.contractorCompany}</p>
                      <p className="mt-2">
                        Initials: {formData.contractorInitials || getInitials(formData.contractorName)}
                      </p>
                      <p className="mt-2">
                        Date: {format(new Date(), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">CLIENT:</p>
                      {formData.signatureImage ? (
                        <div className="mt-4">
                          <img
                            src={formData.signatureImage}
                            alt="Client signature"
                            className="max-h-16 mb-2"
                          />
                        </div>
                      ) : (
                        <div className="mt-6 border-b border-dashed border-gray-400 pt-6"></div>
                      )}
                      <p className="mt-2">{formData.clientName}</p>
                      <p>Authorized Representative</p>
                      <p className="mt-2">
                        Initials: {formData.clientNameInitials}
                      </p>
                      <p className="mt-2">
                        Date: {format(new Date(), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Last updated: {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
              </div>
              <PdfDownloadButton 
                fileName={`${formData.contractTitle || 'Contract'}.pdf`}
                className=""
              >
                Download as PDF
              </PdfDownloadButton>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}