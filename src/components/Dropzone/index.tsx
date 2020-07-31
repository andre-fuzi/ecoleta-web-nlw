/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'

import './style.css'

interface Props {
  onFileUploaded: (file: File) => void
}
const Dropzone: React.FC<Props> = ({ onFileUploaded }: Props) => {
  const [selecteFileUrl, setSelectedFileUrl] = useState<string>('')
  const onDrop = useCallback((acceptedFile) => {
    const file = acceptedFile[0]
    const fileUrl = URL.createObjectURL(file)

    setSelectedFileUrl(fileUrl)
    onFileUploaded(file)
  }, [onFileUploaded])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />

      { selecteFileUrl
        ? <img src={selecteFileUrl} alt="Thumbnail" />
        : (
          <p>
            <FiUpload />
            Imagem do estabelecimento
          </p>
        )}
    </div>
  )
}

export default Dropzone
