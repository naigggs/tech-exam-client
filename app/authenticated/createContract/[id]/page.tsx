"use client";

import React, { Suspense } from "react";
import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  CalendarIcon,
  Download,
  Eye,
  FileText,
  Pencil,
  Save,
  Upload,
  Loader2,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ContractMaker({ params }: PageProps) {
  const unwrappedParams = React.use(params) as { id: string };
  const { id } = unwrappedParams;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    contractTitle: "Service Agreement Contract",
    contractorName: "Admin Account",
    contractorCompany: "Avorino ADU",
    clientName: "",
    clientNameInitials: "",
    clientAddress: "Philippines",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    paymentAmount: "$5",
    paymentTerms: "50% upfront, 50% upon completion",
    scope:
      "Provide consulting services including market analysis, strategic planning, and implementation guidance.",
    termsAndConditions: `1. SERVICES: The Contractor agrees to provide the services described in the Scope of Work section.

2. PAYMENT: The Client agrees to pay the Contractor as specified in the Payment Terms section.

3. TERM: This Agreement shall commence on the Start Date and continue until the End Date, unless terminated earlier.

4. CONFIDENTIALITY: The Contractor agrees to maintain the confidentiality of all proprietary information.

5. INTELLECTUAL PROPERTY: All work product created by the Contractor shall be the property of the Client.

6. INDEPENDENT CONTRACTOR: The Contractor is an independent contractor and not an employee of the Client.

7. TERMINATION: Either party may terminate this Agreement with 30 days written notice.

8. GOVERNING LAW: This Agreement shall be governed by the laws of the State of New York.`,
    additionalNotes: "",
    includeSignature: true,
    signatureImage: null as string | null, // Base64 string of the uploaded image
    clientSignature: "" as string,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          signatureImage: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchProposalById = async () => {
      if (!id) return;
      try {
        const response = await fetch(`${API_URL}/proposals/${id}`);
        if (!response.ok) throw new Error("Failed to fetch proposal");
        const data = await response.json();

        // Update form data with proposal data
        setFormData((prevData) => ({
          ...prevData,
          contractTitle: `Contract for ${data.client_name} || ${data.name}`,
          description: data.description,
          clientName: data.client_name,
          clientEmail: data.client_email,
          // Keep other default values from prevData
        }));
      } catch (error) {
        console.error("Error fetching proposal:", error);
      }
    };

    fetchProposalById();
  }, [id, API_URL]);

  useEffect(() => {
    const fetchContractData = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/contracts/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData((prevData) => ({
            ...prevData,
            ...data,
          }));
        }
      } catch (error) {
        console.error("Error fetching contract data:", error);
      }
    };

    fetchContractData();
  }, [id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        proposal: id,
        contract_title: formData.contractTitle,
        contractor_name: formData.contractorName,
        terms_and_conditions: formData.termsAndConditions,
        client_signature: formData.signatureImage || "",
        client_initials: "",
        contractor_signature: "",
        contractor_initials: getInitials(formData.contractorName),
        payment_terms: formData.paymentTerms,
        // Convert dates to YYYY-MM-DD format with no time component
        start_date: formData.startDate.toISOString().split("T")[0],
        end_date: formData.endDate.toISOString().split("T")[0],
        // Remove $ and convert to float
        payment_amount: parseFloat(formData.paymentAmount.replace("$", "")),
        scope: formData.scope,
        additional_notes: formData.additionalNotes,
        contractor_company: formData.contractorCompany,
        client_address: formData.clientAddress,
      };

      const response = await fetch(`${API_URL}/contracts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save contract draft");
      }

      toast.success("Contract created successfully!", {
        description: `Your contract "${formData.contractTitle}" has been saved.`,
        duration: 4000,
      });

      router.push("/authenticated/contract");
    } catch (error) {
      console.error("Error saving contract draft:", error);
      toast.error("Failed to create contract", {
        description:
          "Please try again or contact support if the issue persists.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "MMMM d, yyyy");
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "";
  };

  return (
    <main className="flex-1 p-6 lg:p-8 bg-muted/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Maker</h1>
          <p className="text-muted-foreground mt-1">
            Create and customize legal contracts
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveDraft} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Section */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
              <CardDescription>
                Enter the basic information for your contract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-title">Contract Title</Label>
                <Input
                  id="contract-title"
                  value={formData.contractTitle}
                  onChange={(e) =>
                    handleInputChange("contractTitle", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contractor-name">Contractor Name</Label>
                  <Input
                    id="contractor-name"
                    value={formData.contractorName}
                    onChange={(e) =>
                      handleInputChange("contractorName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractor-company">Contractor Company</Label>
                  <Input
                    id="contractor-company"
                    value={formData.contractorCompany}
                    onChange={(e) =>
                      handleInputChange("contractorCompany", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={formData.clientName}
                    onChange={(e) =>
                      handleInputChange("clientName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-address">Client Address</Label>
                  <Input
                    id="client-address"
                    value={formData.clientAddress}
                    onChange={(e) =>
                      handleInputChange("clientAddress", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) =>
                          date && handleInputChange("startDate", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) =>
                          date && handleInputChange("endDate", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Payment Amount</Label>
                  <Input
                    id="payment-amount"
                    value={formData.paymentAmount}
                    onChange={(e) =>
                      handleInputChange("paymentAmount", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-terms">Payment Terms</Label>
                  <Input
                    id="payment-terms"
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      handleInputChange("paymentTerms", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Scope & Terms</CardTitle>
              <CardDescription>
                Define the scope of work and terms of the contract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scope">Scope of Work</Label>
                <Textarea
                  id="scope"
                  rows={4}
                  value={formData.scope}
                  onChange={(e) => handleInputChange("scope", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms and Conditions</Label>
                <Textarea
                  id="terms"
                  rows={10}
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    handleInputChange("termsAndConditions", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Enter any additional notes or special conditions..."
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    handleInputChange("additionalNotes", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="include-signature"
                  checked={formData.includeSignature}
                  onCheckedChange={(checked) =>
                    handleInputChange("includeSignature", checked)
                  }
                />
                <Label htmlFor="include-signature">
                  Include signature fields
                </Label>
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
                  Preview how your contract will appear
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Full Screen
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md  shadow-sm">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {formData.contractTitle}.pdf
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button size="sm">
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="contract-content p-8 min-h-[800px] max-h-[800px] overflow-auto prose dark:prose-invert max-w-none bg-white text-black">
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

                  <h2 className="text-xl font-semibold mt-6">
                    3. COMPENSATION
                  </h2>
                  <p>
                    Client agrees to pay Contractor {formData.paymentAmount} for
                    the services rendered. Payment terms:{" "}
                    {formData.paymentTerms}.
                  </p>

                  <h2 className="text-xl font-semibold mt-6">
                    4. TERMS AND CONDITIONS
                  </h2>
                  <div className="whitespace-pre-line">
                    {formData.termsAndConditions}
                  </div>

                  {formData.additionalNotes && (
                    <>
                      <h2 className="text-xl font-semibold mt-6">
                        5. ADDITIONAL NOTES
                      </h2>
                      <p>{formData.additionalNotes}</p>
                    </>
                  )}

                  {formData.includeSignature && (
                    <div className="mt-10 grid grid-cols-2 gap-8">
                      <div>
                        <p className="font-semibold">CONTRACTOR:</p>
                        <div className="mt-6 border-b border-dashed border-gray-400 pt-6"></div>
                        <p className="mt-2">{formData.contractorName}</p>
                        <p>{formData.contractorCompany}</p>
                        <p className="mt-2">
                          Initials: {getInitials(formData.contractorName)}
                        </p>
                        <p className="mt-2">Date: ____________________</p>
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
                        <p className="mt-2">Date: ____________________</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Last updated: {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
              </div>
              <Button onClick={handleSaveDraft} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Saving..." : "Download as PDF"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
