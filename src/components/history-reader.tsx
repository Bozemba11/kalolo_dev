import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Languages, BookOpen, Quote, Info, Tag, Download, Printer } from "lucide-react"
import { HistoryRecord } from "./dashboard"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

interface HistoryReaderProps {
  history: any // Using any for extended fields
  onBack: () => void
}

export function HistoryReader({ history, onBack }: HistoryReaderProps) {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-serif text-primary">{history.speaker_name}</h1>
            <p className="text-muted-foreground text-sm italic">{history.context}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-primary/20 bg-transparent hover:bg-primary/5">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-primary/20 bg-transparent hover:bg-primary/5">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Tabs defaultValue="refined" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-primary/5 p-1">
              <TabsTrigger value="refined" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Authentic Voice</TabsTrigger>
              <TabsTrigger value="natural" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Translation</TabsTrigger>
              <TabsTrigger value="raw" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Raw Audio Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="refined" className="mt-6 space-y-6">
              <div className="bg-white/40 border border-primary/10 p-8 rounded-3xl shadow-sm relative">
                <Quote className="absolute top-4 right-4 w-12 h-12 text-primary/5" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  REFINED ORIGINAL TRANSCRIPT
                </h3>
                <div className="prose prose-stone dark:prose-invert max-w-none whitespace-pre-wrap font-serif leading-loose text-lg">
                  {history.refined_transcript || "No transcript available."}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="natural" className="mt-6 space-y-6">
              <div className="bg-white/40 border border-primary/10 p-8 rounded-3xl shadow-sm relative">
                <Quote className="absolute top-4 right-4 w-12 h-12 text-primary/5" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  NATURAL TRANSLATION
                </h3>
                <div className="prose prose-stone dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                  {history.natural_translation || "No translation available."}
                </div>
                {history.literal_translation && (
                  <>
                    <Separator className="my-8 bg-primary/10" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-4">LITERAL TRANSLATION (Researchers Only)</h3>
                    <div className="text-sm text-muted-foreground italic whitespace-pre-wrap">
                      {history.literal_translation}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="raw" className="mt-6">
              <div className="bg-black/5 p-8 rounded-3xl border border-primary/10 font-mono text-sm opacity-60">
                {history.raw_transcript}
              </div>
            </TabsContent>
          </Tabs>

          <section className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              FAMILY SUMMARY
            </h3>
            <p className="text-lg leading-relaxed text-foreground/90 font-serif">
              {history.family_summary}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white/40 border border-primary/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
              <User className="w-4 h-4" />
              SPEAKER INFO
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Metadata</Label>
                <p className="text-sm font-medium">{history.speaker_metadata}</p>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Original Dialect</Label>
                <p className="text-sm font-medium">{history.original_language}</p>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Target Language</Label>
                <p className="text-sm font-medium">{history.target_language}</p>
              </div>
            </div>
          </section>

          <section className="bg-white/40 border border-primary/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
              <Info className="w-4 h-4" />
              CULTURAL NOTES
            </h3>
            <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {history.cultural_notes}
            </div>
          </section>

          <section className="bg-white/40 border border-primary/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              ARCHIVE METADATA
            </h3>
            <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {history.metadata}
            </div>
            <div className="pt-4 mt-4 border-t border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Confidence</span>
                <Badge variant={history.confidence?.includes('High') ? 'default' : 'secondary'} className="text-[10px]">
                  {history.confidence}
                </Badge>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
