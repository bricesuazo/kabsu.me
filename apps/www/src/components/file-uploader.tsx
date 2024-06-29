"use client";

import type { DropzoneProps, FileRejection } from "react-dropzone";
import * as React from "react";
import { UploadIcon } from "lucide-react";
import Dropzone from "react-dropzone";
import { toast } from "sonner";

import { useControllableState } from "~/hooks/use-controllable-state";
import { cn, formatBytes } from "~/lib/utils";

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type React.Dispatch<React.SetStateAction<File[]>>
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps["accept"];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps["maxSize"];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFiles={5}
   */
  maxFiles?: DropzoneProps["maxFiles"];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    accept = { "image/*": [] },
    maxSize = 1024 * 1024 * 2,
    maxFiles = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time");
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`);
        });
      }

      if (
        onUpload &&
        updatedFiles.length > 0 &&
        updatedFiles.length <= maxFiles
      ) {
        const target =
          updatedFiles.length > 0 ? `${updatedFiles.length} files` : `file`;

        toast.promise(onUpload(updatedFiles), {
          loading: `Uploading ${target}...`,
          success: () => {
            setFiles([]);
            return `${target} uploaded`;
          },
          error: `Failed to upload ${target}`,
        });
      }
    },

    [files, maxFiles, multiple, onUpload, setFiles],
  );

  const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;

  return (
    <Dropzone
      onDrop={onDrop}
      accept={accept}
      maxSize={maxSize}
      maxFiles={maxFiles}
      multiple={maxFiles > 1 || multiple}
      disabled={isDisabled}
    >
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div
          {...getRootProps()}
          className={cn(
            "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragActive && "border-muted-foreground/50",
            isDisabled && "pointer-events-none opacity-60",
            className,
          )}
          {...dropzoneProps}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
              <div className="rounded-full border border-dashed p-3">
                <UploadIcon
                  className="size-7 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <p className="font-medium text-muted-foreground">
                Drop the files here
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
              <div className="rounded-full border border-dashed p-3">
                <UploadIcon
                  className="size-7 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-px">
                <p className="font-medium text-muted-foreground">
                  Drag {`'n'`} drop files here, or click to select files
                </p>
                <p className="text-sm text-muted-foreground/70">
                  You can upload
                  {maxFiles > 1
                    ? ` ${maxFiles === Infinity ? "multiple" : maxFiles}
                      files (up to ${formatBytes(maxSize)} each)`
                    : ` a file with ${formatBytes(maxSize)}`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </Dropzone>
  );
}
