import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";
import { SavedNewsLibrary } from "@/components/intel/SavedNewsLibrary";
export default function SavedNewsPage() { return <div className="min-h-screen bg-[#020817] px-4 py-10 text-white"><div className="mx-auto max-w-7xl"><Link href="/intel/news" className="text-sm text-cyan-300"><ArrowLeft className="mr-2 inline h-4 w-4" />All news</Link><h1 className="mb-8 mt-8 flex items-center gap-3 text-4xl font-bold"><Bookmark className="text-[#FFBF00]" />Saved stories</h1><SavedNewsLibrary /></div></div>; }
