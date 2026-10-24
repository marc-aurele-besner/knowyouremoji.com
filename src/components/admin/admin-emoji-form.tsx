'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Emoji, EmojiDraft } from '@/types/emoji';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';

interface AdminEmojiFormProps {
  emoji?: Emoji;
}

const CATEGORIES = [
  { value: 'faces', label: 'Smileys & Faces' },
  { value: 'people', label: 'People & Body' },
  { value: 'animals', label: 'Animals & Nature' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'travel', label: 'Travel & Places' },
  { value: 'activities', label: 'Activities' },
  { value: 'objects', label: 'Objects' },
  { value: 'symbols', label: 'Symbols' },
  { value: 'flags', label: 'Flags' },
];

const CONTEXT_TYPES = [
  'LITERAL',
  'SLANG',
  'IRONIC',
  'PASSIVE_AGGRESSIVE',
  'DATING',
  'WORK',
  'RED_FLAG',
];
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];

const labelClass = 'mb-1.5 block text-[13px] font-semibold text-foreground';
const selectClass =
  'h-11 rounded-xl border border-card-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500/25';
const PLATFORMS = ['IMESSAGE', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP', 'SLACK', 'DISCORD', 'TWITTER'];
const GENERATIONS = ['GEN_Z', 'MILLENNIAL', 'GEN_X', 'BOOMER'];

export function AdminEmojiForm({ emoji }: AdminEmojiFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<EmojiDraft>({
    unicode: emoji?.unicode || '',
    slug: emoji?.slug || '',
    character: emoji?.character || '',
    name: emoji?.name || '',
    shortName: emoji?.shortName || '',
    category: emoji?.category || 'faces',
    subcategory: emoji?.subcategory || '',
    unicodeVersion: emoji?.unicodeVersion || '15.0',
    baseMeaning: emoji?.baseMeaning || '',
    tldr: emoji?.tldr || '',
    contextMeanings: emoji?.contextMeanings || [],
    platformNotes: emoji?.platformNotes || [],
    generationalNotes: emoji?.generationalNotes || [],
    warnings: emoji?.warnings || [],
    relatedCombos: emoji?.relatedCombos || [],
    seoTitle: emoji?.seoTitle || '',
    seoDescription: emoji?.seoDescription || '',
    skinToneVariations: emoji?.skinToneVariations || [],
    skinToneBase: emoji?.skinToneBase || '',
  });

  const updateField = <K extends keyof EmojiDraft>(field: K, value: EmojiDraft[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addContextMeaning = () => {
    updateField('contextMeanings', [
      ...(formData.contextMeanings ?? []),
      { context: 'SLANG', meaning: '', example: '', riskLevel: 'LOW' },
    ]);
  };

  const updateContextMeaning = (index: number, field: string, value: string) => {
    const updated = [...(formData.contextMeanings ?? [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('contextMeanings', updated);
  };

  const removeContextMeaning = (index: number) => {
    updateField(
      'contextMeanings',
      (formData.contextMeanings ?? []).filter((_, i) => i !== index)
    );
  };

  const addPlatformNote = () => {
    updateField('platformNotes', [
      ...(formData.platformNotes ?? []),
      { platform: 'IMESSAGE', note: '' },
    ]);
  };

  const updatePlatformNote = (index: number, field: string, value: string) => {
    const updated = [...(formData.platformNotes ?? [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('platformNotes', updated);
  };

  const removePlatformNote = (index: number) => {
    updateField(
      'platformNotes',
      (formData.platformNotes ?? []).filter((_, i) => i !== index)
    );
  };

  const addGenerationalNote = () => {
    updateField('generationalNotes', [
      ...(formData.generationalNotes ?? []),
      { generation: 'GEN_Z', note: '' },
    ]);
  };

  const updateGenerationalNote = (index: number, field: string, value: string) => {
    const updated = [...(formData.generationalNotes ?? [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('generationalNotes', updated);
  };

  const removeGenerationalNote = (index: number) => {
    updateField(
      'generationalNotes',
      (formData.generationalNotes ?? []).filter((_, i) => i !== index)
    );
  };

  const addWarning = () => {
    updateField('warnings', [
      ...(formData.warnings ?? []),
      { title: '', description: '', severity: 'LOW' },
    ]);
  };

  const updateWarning = (index: number, field: string, value: string) => {
    const updated = [...(formData.warnings ?? [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('warnings', updated);
  };

  const removeWarning = (index: number) => {
    updateField(
      'warnings',
      (formData.warnings ?? []).filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = emoji ? `/api/admin/emojis/${emoji.slug}` : '/api/admin/emojis';
      const method = emoji ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save emoji');
      }

      toast({
        title: 'Success',
        description: `Emoji ${emoji ? 'updated' : 'created'} successfully!`,
      });
      router.push('/admin/emojis');
    } catch {
      toast({ title: 'Error', description: 'Failed to save emoji', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="emoji-character" className={labelClass}>
                Character
              </label>
              <Input
                id="emoji-character"
                value={formData.character}
                onChange={(e) => updateField('character', e.target.value)}
                placeholder="💀"
                required
              />
            </div>
            <div>
              <label htmlFor="emoji-name" className={labelClass}>
                Name
              </label>
              <Input
                id="emoji-name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Skull"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="emoji-unicode" className={labelClass}>
                Unicode
              </label>
              <Input
                id="emoji-unicode"
                value={formData.unicode}
                onChange={(e) => updateField('unicode', e.target.value)}
                placeholder="1F480"
                required
              />
            </div>
            <div>
              <label htmlFor="emoji-slug" className={labelClass}>
                Slug
              </label>
              <Input
                id="emoji-slug"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="skull"
                pattern="[a-z0-9-]+"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label id="emoji-category-label" className={labelClass}>
                Category
              </label>
              <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                <SelectTrigger aria-labelledby="emoji-category-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="emoji-subcategory" className={labelClass}>
                Subcategory
              </label>
              <Input
                id="emoji-subcategory"
                value={formData.subcategory}
                onChange={(e) => updateField('subcategory', e.target.value)}
                placeholder="face-negative"
              />
            </div>
            <div>
              <label htmlFor="emoji-unicodeVersion" className={labelClass}>
                Unicode Version
              </label>
              <Input
                id="emoji-unicodeVersion"
                value={formData.unicodeVersion}
                onChange={(e) => updateField('unicodeVersion', e.target.value)}
                placeholder="15.0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="emoji-shortName" className={labelClass}>
              Short Name
            </label>
            <Input
              id="emoji-shortName"
              value={formData.shortName}
              onChange={(e) => updateField('shortName', e.target.value)}
              placeholder="skull"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Meanings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meanings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="emoji-baseMeaning" className={labelClass}>
              Base Meaning
            </label>
            <Input
              id="emoji-baseMeaning"
              value={formData.baseMeaning}
              onChange={(e) => updateField('baseMeaning', e.target.value)}
              placeholder="A human skull..."
              required
            />
          </div>
          <div>
            <label htmlFor="emoji-tldr" className={labelClass}>
              TL;DR
            </label>
            <Input
              id="emoji-tldr"
              value={formData.tldr}
              onChange={(e) => updateField('tldr', e.target.value)}
              placeholder="Quick summary of real-world usage..."
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Context Meanings */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Context Meanings</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addContextMeaning}>
              + Add Context
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.contextMeanings ?? []).map((ctx, index) => (
            <div
              key={index}
              className="flex flex-col gap-2.5 rounded-xl border border-card-border bg-background p-3.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Context"
                  value={ctx.context}
                  onChange={(e) => updateContextMeaning(index, 'context', e.target.value)}
                  className={selectClass}
                >
                  {CONTEXT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Risk level"
                  value={ctx.riskLevel}
                  onChange={(e) => updateContextMeaning(index, 'riskLevel', e.target.value)}
                  className={selectClass}
                >
                  {RISK_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContextMeaning(index)}
                  className="ml-auto text-danger hover:bg-danger-background"
                >
                  Remove
                </Button>
              </div>
              <Input
                value={ctx.meaning}
                onChange={(e) => updateContextMeaning(index, 'meaning', e.target.value)}
                placeholder="Meaning in this context..."
              />
              <Input
                value={ctx.example}
                onChange={(e) => updateContextMeaning(index, 'example', e.target.value)}
                placeholder="Example usage..."
              />
            </div>
          ))}
          {(formData.contextMeanings ?? []).length === 0 && (
            <p className="rounded-xl border border-dashed border-card-border px-4 py-6 text-center text-sm text-muted-foreground">
              No context meanings yet. Click &quot;Add Context&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Platform Notes */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Platform Notes</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addPlatformNote}>
              + Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.platformNotes ?? []).map((note, index) => (
            <div
              key={index}
              className="flex flex-col gap-2.5 rounded-xl border border-card-border bg-background p-3.5 sm:flex-row sm:items-center"
            >
              <select
                aria-label="Platform"
                value={note.platform}
                onChange={(e) => updatePlatformNote(index, 'platform', e.target.value)}
                className={selectClass}
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
              <Input
                value={note.note}
                onChange={(e) => updatePlatformNote(index, 'note', e.target.value)}
                placeholder="Platform-specific note..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePlatformNote(index)}
                className="ml-auto text-danger hover:bg-danger-background"
              >
                Remove
              </Button>
            </div>
          ))}
          {(formData.platformNotes ?? []).length === 0 && (
            <p className="rounded-xl border border-dashed border-card-border px-4 py-6 text-center text-sm text-muted-foreground">
              No platform notes yet. Click &quot;Add Note&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Generational Notes */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Generational Notes</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addGenerationalNote}>
              + Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.generationalNotes ?? []).map((note, index) => (
            <div
              key={index}
              className="flex flex-col gap-2.5 rounded-xl border border-card-border bg-background p-3.5 sm:flex-row sm:items-center"
            >
              <select
                aria-label="Generation"
                value={note.generation}
                onChange={(e) => updateGenerationalNote(index, 'generation', e.target.value)}
                className={selectClass}
              >
                {GENERATIONS.map((gen) => (
                  <option key={gen} value={gen}>
                    {gen}
                  </option>
                ))}
              </select>
              <Input
                value={note.note}
                onChange={(e) => updateGenerationalNote(index, 'note', e.target.value)}
                placeholder="Generational note..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGenerationalNote(index)}
                className="ml-auto text-danger hover:bg-danger-background"
              >
                Remove
              </Button>
            </div>
          ))}
          {(formData.generationalNotes ?? []).length === 0 && (
            <p className="rounded-xl border border-dashed border-card-border px-4 py-6 text-center text-sm text-muted-foreground">
              No generational notes yet. Click &quot;Add Note&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Warnings */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Warnings</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addWarning}>
              + Add Warning
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.warnings ?? []).map((warning, index) => (
            <div
              key={index}
              className="flex flex-col gap-2.5 rounded-xl border border-card-border bg-background p-3.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={warning.title}
                  onChange={(e) => updateWarning(index, 'title', e.target.value)}
                  placeholder="Warning title..."
                  className="flex-1"
                />
                <select
                  aria-label="Severity"
                  value={warning.severity}
                  onChange={(e) => updateWarning(index, 'severity', e.target.value)}
                  className={selectClass}
                >
                  {RISK_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeWarning(index)}
                  className="ml-auto text-danger hover:bg-danger-background"
                >
                  Remove
                </Button>
              </div>
              <Input
                value={warning.description}
                onChange={(e) => updateWarning(index, 'description', e.target.value)}
                placeholder="Warning description..."
              />
            </div>
          ))}
          {(formData.warnings ?? []).length === 0 && (
            <p className="rounded-xl border border-dashed border-card-border px-4 py-6 text-center text-sm text-muted-foreground">
              No warnings yet. Click &quot;Add Warning&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="emoji-seoTitle" className={labelClass}>
              SEO Title
            </label>
            <Input
              id="emoji-seoTitle"
              value={formData.seoTitle}
              onChange={(e) => updateField('seoTitle', e.target.value)}
              placeholder="💀 Skull Emoji Meaning - What Does 💀 Really Mean?"
              required
            />
          </div>
          <div>
            <label htmlFor="emoji-seoDescription" className={labelClass}>
              SEO Description
            </label>
            <Input
              id="emoji-seoDescription"
              value={formData.seoDescription}
              onChange={(e) => updateField('seoDescription', e.target.value)}
              placeholder="Learn what the skull emoji 💀 really means..."
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-3 border-t border-card-border bg-background/90 px-1 py-4 backdrop-blur">
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : emoji ? 'Update Emoji' : 'Create Emoji'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/emojis')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
