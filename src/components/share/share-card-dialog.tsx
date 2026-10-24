'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CloseIcon, DownloadIcon, ShareIcon } from '@/components/emoji/emoji-icons';
import { ShareButtons } from './share-buttons';

export interface ShareCardDialogProps {
  /** Emoji character shown on the card */
  character: string;
  /** Emoji name */
  name: string;
  /** One-line meaning shown on the card */
  tldr: string;
  /** Absolute URL of the page being shared */
  url: string;
  /** Optional absolute URL of a pre-rendered card image (e.g. the OG image) */
  imageUrl?: string;
  /** File name used when downloading the card image */
  imageFileName?: string;
  /** Analytics content type */
  contentType?: string;
  /** Extra classes for the trigger button */
  triggerClassName?: string;
}

/**
 * "Share" pill that opens a dialog with a preview card of the meaning,
 * share buttons (X, Facebook, copy link) and an optional card-image download.
 */
export function ShareCardDialog({
  character,
  name,
  tldr,
  url,
  imageUrl,
  imageFileName,
  contentType = 'emoji',
  triggerClassName,
}: ShareCardDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          <ShareIcon />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[520px]">
        <div className="flex items-center justify-between gap-4">
          <DialogTitle className="text-base">Share this meaning</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close">
              <CloseIcon size={18} />
            </Button>
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">
          Share what {character} {name} really means.
        </DialogDescription>

        <div
          className="my-4 rounded-2xl bg-foreground p-7 text-center text-background"
          data-testid="share-card-preview"
        >
          <div className="emoji-display text-6xl" aria-hidden="true">
            {character}
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{name}</p>
          <p className="mt-2 opacity-80">{tldr}</p>
          <p className="mt-3.5 text-xs opacity-60">knowyouremoji.com</p>
        </div>

        <ShareButtons
          url={url}
          title={`What does ${character} really mean?`}
          description={tldr}
          platforms={['twitter', 'facebook', 'copy']}
          size="sm"
          variant="outline"
          contentType={contentType}
        />

        {imageUrl && (
          <Button asChild variant="outline" className="mt-3 w-full">
            <a href={imageUrl} download={imageFileName}>
              <DownloadIcon />
              Download card image
            </a>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
