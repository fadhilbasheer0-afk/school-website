import React from "react";
import { notFound } from "next/navigation";
import About from "@/app/about/page";
import Academics from "@/app/academics/page";
import Faculty from "@/app/faculty/page";
import Facilities from "@/app/facilities/page";
import Activities from "@/app/activities/page";
import Gallery from "@/app/gallery/page";
import Events from "@/app/events/page";
import Admissions from "@/app/admissions/page";
import News from "@/app/news/page";
import Contact from "@/app/contact/page";

interface Props {
  params: Promise<{
    schoolSlug: string;
    pageSlug: string;
  }>;
}

export default async function DynamicTenantPage({ params }: Props) {
  const { pageSlug } = await params;

  switch (pageSlug.toLowerCase()) {
    case "about":
      return <About />;
    case "academics":
      return <Academics />;
    case "faculty":
      return <Faculty />;
    case "facilities":
      return <Facilities />;
    case "activities":
      return <Activities />;
    case "gallery":
      return <Gallery />;
    case "events":
      return <Events />;
    case "admissions":
      return <Admissions />;
    case "news":
      return <News />;
    case "contact":
      return <Contact />;
    default:
      notFound();
  }
}
