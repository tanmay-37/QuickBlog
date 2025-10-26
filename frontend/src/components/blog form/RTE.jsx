import React from 'react'
import { Editor } from '@tinymce/tinymce-react';
import { Controller } from 'react-hook-form';

export default function RTE({
  name,
  control,
  label,
  defaultValue = "",
  rules = {}
}) {
  return (
    <div className='w-full'>
      
      {/* This style block will find the promotion button by its class 
        (.tox-promotion) and force it to be hidden.
      */}
      <style>{`
        .tox-promotion {
          display: none !important;
        }
      `}</style>
      
      {label && <label className='inline-block mb-1 pl-1'>{label}</label>}

      <Controller
        name={name || "content"}
        control={control}
        rules={rules}
        render={({ field: { onChange } }) => (
          <Editor
            // Remember to move this to a .env file!
            apiKey='zsch15dgxjj4wwmdau1sdwsdiiqwn8tr5rbea41xpvksopwy'
            initialValue={defaultValue}
            init={{
              height: 500,
              menubar: true,
              // This is the "official" way
              promotion: false, 
              plugins: [
                "image",
                "advlist",
                "autolink",
                "lists",
                "link",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | image | bold italic forecolor | alignleft aligncenter bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |removeformat | help",
              content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"
            }}
            onEditorChange={onChange}
          />
        )}
      />
    </div>
  )
}