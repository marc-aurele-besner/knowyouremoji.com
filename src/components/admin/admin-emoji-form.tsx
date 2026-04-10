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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Character</label>
              <Input
                value={formData.character}
                onChange={(e) => updateField('character', e.target.value)}
                placeholder="💀"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Skull"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Unicode</label>
              <Input
                value={formData.unicode}
                onChange={(e) => updateField('unicode', e.target.value)}
                placeholder="1F480"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="skull"
                pattern="[a-z0-9-]+"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                <SelectTrigger>
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
              <label className="block text-sm font-medium mb-1">Subcategory</label>
              <Input
                value={formData.subcategory}
                onChange={(e) => updateField('subcategory', e.target.value)}
                placeholder="face-negative"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unicode Version</label>
              <Input
                value={formData.unicodeVersion}
                onChange={(e) => updateField('unicodeVersion', e.target.value)}
                placeholder="15.0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Name</label>
            <Input
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
          <CardTitle>Meanings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Meaning</label>
            <Input
              value={formData.baseMeaning}
              onChange={(e) => updateField('baseMeaning', e.target.value)}
              placeholder="A human skull..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">TL;DR</label>
            <Input
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
          <div className="flex items-center justify-between">
            <CardTitle>Context Meanings</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addContextMeaning}>
              + Add Context
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.contextMeanings ?? []).map((ctx, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4"
            >
              <div className="flex items-center gap-2">
                <select
                  value={ctx.context}
                  onChange={(e) => updateContextMeaning(index, 'context', e.target.value)}
                  className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  {CONTEXT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  value={ctx.riskLevel}
                  onChange={(e) => updateContextMeaning(index, 'riskLevel', e.target.value)}
                  className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
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
                  className="text-red-500"
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No context meanings yet. Click &quot;Add Context&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Platform Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Platform Notes</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addPlatformNote}>
              + Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.platformNotes ?? []).map((note, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4"
            >
              <select
                value={note.platform}
                onChange={(e) => updatePlatformNote(index, 'platform', e.target.value)}
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
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
                className="text-red-500"
              >
                Remove
              </Button>
            </div>
          ))}
          {(formData.platformNotes ?? []).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No platform notes yet. Click &quot;Add Note&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Generational Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Generational Notes</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addGenerationalNote}>
              + Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.generationalNotes ?? []).map((note, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4"
            >
              <select
                value={note.generation}
                onChange={(e) => updateGenerationalNote(index, 'generation', e.target.value)}
                className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
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
                className="text-red-500"
              >
                Remove
              </Button>
            </div>
          ))}
          {(formData.generationalNotes ?? []).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No generational notes yet. Click &quot;Add Note&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Warnings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Warnings</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addWarning}>
              + Add Warning
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.warnings ?? []).map((warning, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={warning.title}
                  onChange={(e) => updateWarning(index, 'title', e.target.value)}
                  placeholder="Warning title..."
                  className="flex-1"
                />
                <select
                  value={warning.severity}
                  onChange={(e) => updateWarning(index, 'severity', e.target.value)}
                  className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
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
                  className="text-red-500"
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No warnings yet. Click &quot;Add Warning&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">SEO Title</label>
            <Input
              value={formData.seoTitle}
              onChange={(e) => updateField('seoTitle', e.target.value)}
              placeholder="💀 Skull Emoji Meaning - What Does 💀 Really Mean?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SEO Description</label>
            <Input
              value={formData.seoDescription}
              onChange={(e) => updateField('seoDescription', e.target.value)}
              placeholder="Learn what the skull emoji 💀 really means..."
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : emoji ? 'Update Emoji' : 'Create Emoji'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/emojis')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
