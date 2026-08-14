import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";
import { NewsPreferences } from "@/components/intel/NewsPreferences";
export default function NewsPreferencesPage() { return <div className="min-h-screen bg-[#020817] px-4 py-10 text-white"><div className="mx-auto max-w-5xl"><Link href="/intel/news" className="text-sm text-cyan-300"><ArrowLeft className="mr-2 inline h-4 w-4" />All news</Link><h1 className="mt-8 flex items-center gap-3 text-4xl font-bold"><Settings2 className="text-[#FFBF00]" />Your news</h1><p className="mb-8 mt-3 text-slate-400">Choose the topics you want GEM to prioritize on this device.</p><NewsPreferences /></div></div>; }
