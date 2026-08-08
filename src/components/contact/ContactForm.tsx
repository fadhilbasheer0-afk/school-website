"use client";

import React, { useState } from "react";
import { ShieldCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

/**
 * Client-side contact form. Submission is simulated only — it is not wired to
 * a backend. Connect this to Supabase / the CMS API when available.
 */
export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      setFormData(initialForm);
    } catch {
      setError("Failed to transmit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 p-8 md:p-10 border border-slate-202/50 dark:border-slate-800/80 rounded-3xl shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white mb-2">
        Send Us a Message
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-light">
        Fill in your inquiry details, and we&rsquo;ll route it to the appropriate department.
      </p>

      {success ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-2xl p-6 text-center text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
          <h3 className="font-bold text-lg">Message Delivered Successfully!</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-450 mt-1 max-w-sm mx-auto leading-relaxed">
            Thank you for reaching out. We have received your submission code and will follow up shortly.
          </p>
          <Button variant="outline" className="mt-6 border-emerald-350 text-emerald-850 dark:text-emerald-400 hover:bg-emerald-100" onClick={() => setSuccess(false)}>
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-label="Contact message form">
          {error && (
            <div role="alert" className="p-3 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/25 border border-red-200/50 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Your Full Name *" id="name">
              <Input
                type="text"
                name="name"
                value={formData.name}
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

          <FormField label="Subject Topic *" id="subject">
            <Input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Campus Tours and Timings Inquiry"
              required
            />
          </FormField>

          <FormField label="Detailed Message *" id="message">
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Provide description of your inquiry here..."
              required
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-3.5 hover:shadow-xl font-bold"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Transmit Message
          </Button>
        </form>
      )}
    </div>
  );
};
