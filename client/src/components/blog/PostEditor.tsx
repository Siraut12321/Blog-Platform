'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { Post } from '@/types';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, Textarea } from '@/components/ui/index';
import RichTextEditor from '@/components/editor/RichTextEditor';

interface PostEditorProps {
  post?: Post;
  mode: 'create' | 'edit';
}

export default function PostEditor({ post, mode }: PostEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    tags: post?.tags.join(', ') || '',
    coverImage: post?.coverImage || '',
    status: post?.status || 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/posts/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.url;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await handleImageUpload(file);
      setForm({ ...form, coverImage: url });
    } catch {
      toast({ title: 'Image upload failed', variant: 'destructive' });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!form.title.trim()) return toast({ title: 'Title is required', variant: 'destructive' });
    if (!form.content.trim() || form.content === '<p></p>') return toast({ title: 'Content is required', variant: 'destructive' });

    setSaving(true);
    try {
      const payload = {
        ...form,
        status,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (mode === 'create') {
        await api.post('/posts', payload);
        toast({ title: 'Post created!', variant: 'success' });
      } else {
        await api.patch(`/posts/${post!._id}`, payload);
        toast({ title: 'Post updated!', variant: 'success' });
      }
      router.push('/dashboard/posts');
    } catch (err: unknown) {
      toast({ title: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save post', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{mode === 'create' ? 'New Post' : 'Edit Post'}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        {form.coverImage ? (
          <div className="relative aspect-video rounded-xl overflow-hidden border">
            <Image src={form.coverImage} alt="Cover" fill className="object-cover" />
            <button
              onClick={() => setForm({ ...form, coverImage: '' })}
              className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
            {imageUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload cover image</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </label>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Your post title..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="text-lg h-12"
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          placeholder="Brief description of your post..."
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="resize-none"
          rows={2}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          placeholder="technology, programming, design..."
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>Content *</Label>
        <RichTextEditor
          content={form.content}
          onChange={(content) => setForm({ ...form, content })}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
}
