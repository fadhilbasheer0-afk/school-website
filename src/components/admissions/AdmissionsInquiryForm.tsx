"use client";

import React, { useState } from "react";
import { ShieldCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea, Select } from "@/components/ui/Form";

const initialForm = {
  parentName: "",
  email: "",
  phone: "",
  studentName: "",
  gradeLevel: "",
  message: "",
};

/**
 * Client-side inquiry form. Submission is simulated only — it is not wired to
 * a backend. Connect this to Supabase / the CMS API when available.
 */
export const AdmissionsInquiryForm: React.FC = () => {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.parentName ||
      !formData.email ||
      !formData.phone ||
      !formData.studentName ||
      !formData.gradeLevel
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    // Simulate Supabase/CMS API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      setFormData(initialForm);
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="inquiry-form" className="bg-white dark:bg-slate-900/60 p-8 md:p-10 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white mb-2">
        Admissions Inquiry Form
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-light">
        Submit your inquiry details below. Our admissions registrar will reach out to you within 24 business hours to address your questions.
      </p>

      {success ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-2xl p-6 text-center text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
          <h3 className="font-bold text-lg">Inquiry Registry Success!</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-450 mt-1 max-w-sm mx-auto leading-relaxed">
            Thank you for submitting. We have dispatched a confirmation email and will contact you directly to schedule an assessment.
          </p>
          <Button variant="outline" className="mt-6 border-emerald-300 text-emerald-850 dark:text-emerald-400 hover:bg-emerald-100" onClick={() => setSuccess(false)}>
            Submit another inquiry
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-label="Admissions inquiry form">
          {error && (
            <div role="alert" className="p-3 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/25 border border-red-200/50 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Parent / Guardian Full Name *" id="parentName">
              <Input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
              />
            </FormField>
            <FormField label="Email Address *" id="email">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Contact Phone Number *" id="phone">
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +1 (555) 012-3456"
                required
              />
            </FormField>
            <FormField label="Target Admission Grade Level *" id="gradeLevel">
              <Select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                placeholder="Select grade level"
                options={[
                  { label: "Early Years (KG 1 – KG 2)", value: "early-years" },
                  { label: "Primary (Grades 1-5)", value: "primary" },
                  { label: "Middle School (Grades 6-8)", value: "middle" },
                  { label: "High School (Grades 9-12)", value: "high" },
                ]}
                required
              />
            </FormField>
          </div>

          <FormField label="Student's Full Name *" id="studentName">
            <Input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              required
            />
          </FormField>

          <FormField label="Additional Message or Questions" id="message">
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Provide any additional academic history, sports interests, or scheduling questions..."
            />
          </FormField>

          <Button
            type="submit"
            variant="secondary"
            className="w-full justify-center py-3.5 hover:shadow-xl font-bold"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Inquiry
          </Button>
        </form>
      )}
    </div>
  );
};
