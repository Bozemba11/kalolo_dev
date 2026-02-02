import { useState } from "react"
import { blink } from "@/lib/blink"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Wand2, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface HistoryPreservationFormProps {
  onComplete: () => void
  onCancel: () => void
}

const SYSTEM_PROMPT = `You are a respectful cultural linguist and oral history guardian specializing in Tanzanian and East African languages/dialects, especially Swahili (Kiswahili) and indigenous tongues like Sukuma, Chaga, Makonde, Datooga, Maa (Maasai), Hadza, and others. Your sole goal is to preserve the authentic spoken voice: exact wording, dialect features (phonetics, tones, slang, code-switching between Swahili and local languages), idioms/proverbs (methali in Swahili), repetitions, hesitations, emotional tone, call-and-response style, and oral storytelling rhythm typical in Tanzanian traditions. NEVER standardize grammar, "correct" non-standard forms, modernize, or erase cultural nuances unless the user explicitly asks. Treat the elder/historian's words as sacred cultural artifacts belonging to their community.

Follow these steps in order:
1. **REFINED ORIGINAL**
2. **NATURAL TRANSLATION**
3. **LITERAL TRANSLATION**
4. **FAMILY SUMMARY**
5. **CONFIDENCE**
6. **CULTURAL NOTES**
7. **METADATA**

Return the output in a structured format with these headers.`

export function HistoryPreservationForm({ onComplete, onCancel }: HistoryPreservationFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    speaker_name: "",
    speaker_metadata: "",
    original_language: "Swahili (Tanzania coastal variant)",
    target_language: "English",
    context: "",
    raw_transcript: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.speaker_name || !formData.raw_transcript) {
      toast.error("Please provide the speaker name and raw transcript")
      return
    }

    setLoading(true)
    try {
      const promptText = `
Original language/dialect: ${formData.original_language}
Target language (for translation): ${formData.target_language}
Speaker metadata: ${formData.speaker_metadata || "Not provided"}
Recording context/theme: ${formData.context || "Not provided"}
Raw ASR transcript: 
"""
${formData.raw_transcript}
"""`

      const { text } = await blink.ai.generateText({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: promptText }
        ]
      })

      // Parse the output (simplified for now, just split by headers)
      const sections = text.split(/\d\.\s\*\*(.*?)\*\*/)
      
      const result: any = {
        refined_transcript: extractSection(text, "REFINED ORIGINAL"),
        natural_translation: extractSection(text, "NATURAL TRANSLATION"),
        literal_translation: extractSection(text, "LITERAL TRANSLATION"),
        family_summary: extractSection(text, "FAMILY SUMMARY"),
        confidence: extractSection(text, "CONFIDENCE"),
        cultural_notes: extractSection(text, "CULTURAL NOTES"),
        metadata: extractSection(text, "METADATA")
      }

      await blink.db.histories.create({
        ...formData,
        ...result,
        user_id: user?.id,
        created_at: new Date().toISOString()
      })

      toast.success("History preserved successfully!")
      onComplete()
    } catch (error) {
      console.error("Failed to preserve history:", error)
      toast.error("Failed to process the history. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const extractSection = (text: string, header: string) => {
    const regex = new RegExp(`\\d\\.\\s\\*\\*${header}\\*\\*([\\s\\S]*?)(?=\\d\\.\\s\\*\\*|$)`, "i")
    const match = text.match(regex)
    return match ? match[1].trim() : ""
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-primary/5">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-serif text-primary">Preservation Wizard</h1>
          <p className="text-muted-foreground text-sm">Follow the sacred path to preserve oral history.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/[0.02] border border-primary/10 p-8 rounded-3xl backdrop-blur-sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="speaker_name" className="text-xs font-bold uppercase tracking-widest text-primary/70">Speaker Name</Label>
            <Input 
              id="speaker_name" 
              placeholder="e.g. Mzee Juma Hamisi" 
              value={formData.speaker_name}
              onChange={e => setFormData(prev => ({ ...prev, speaker_name: e.target.value }))}
              className="bg-primary/5 border-primary/10 h-12 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speaker_metadata" className="text-xs font-bold uppercase tracking-widest text-primary/70">Speaker Metadata</Label>
            <Input 
              id="speaker_metadata" 
              placeholder="e.g. Elder from Mwanza, age 75" 
              value={formData.speaker_metadata}
              onChange={e => setFormData(prev => ({ ...prev, speaker_metadata: e.target.value }))}
              className="bg-primary/5 border-primary/10 h-12 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/70">Original Dialect</Label>
              <Input 
                value={formData.original_language}
                onChange={e => setFormData(prev => ({ ...prev, original_language: e.target.value }))}
                className="bg-primary/5 border-primary/10 h-12 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/70">Target Language</Label>
              <Input 
                value={formData.target_language}
                onChange={e => setFormData(prev => ({ ...prev, target_language: e.target.value }))}
                className="bg-primary/5 border-primary/10 h-12 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context" className="text-xs font-bold uppercase tracking-widest text-primary/70">Recording Context</Label>
            <Input 
              id="context" 
              placeholder="e.g. Family migration story from colonial times" 
              value={formData.context}
              onChange={e => setFormData(prev => ({ ...prev, context: e.target.value }))}
              className="bg-primary/5 border-primary/10 h-12 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="raw_transcript" className="text-xs font-bold uppercase tracking-widest text-primary/70">Raw ASR Transcript</Label>
            <Textarea 
              id="raw_transcript" 
              placeholder="Paste the raw transcript here..." 
              value={formData.raw_transcript}
              onChange={e => setFormData(prev => ({ ...prev, raw_transcript: e.target.value }))}
              className="bg-primary/5 border-primary/10 min-h-[300px] leading-relaxed focus:ring-primary/50 font-mono text-sm"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" size="lg" className="flex-1 h-12 text-base font-bold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preserving Voice...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Preserve & Guard</span>
                </div>
              )}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={onCancel} className="h-12 border-primary/10 bg-transparent hover:bg-primary/5 transition-colors">
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
