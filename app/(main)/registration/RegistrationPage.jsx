"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';


import styles from "./RegistrationPage.module.scss";
import useProductValidation from "@/hooks/useProductValidation";
import { createProduct } from "@/app/_api/productApi";

const RegistrationPage = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleTagDelete = (index) => {
    setTags((current) => current.filter((_, tagIndex) => tagIndex !== index));
  };

  const errors = useProductValidation({
    name,
    description,
    price,
    tagInput,
  });

  const isFormValid =
    name.trim() !== '' &&
    description.trim() !== '' &&
    price.trim() !== '' &&
    tags.length > 0 &&
    !errors.name &&
    !errors.description &&
    !errors.price &&
    !errors.tag;

  const handleTagKeyDown = (e) => {
    if (e.key !== 'Enter') {
      return;
    }

    e.preventDefault();

    const newTag = tagInput.trim();

    if (!newTag) {
      return;
    }

    if (newTag.length > 5) {
      return;
    }

    setTags([...tags, newTag]);
    setTagInput('');
  };


  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    const productData = {
      name,
      description,
      price: Number(price),
      tags,
    };

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const product = await createProduct(productData);

      router.push(`/items/${product.id}`);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>
              상품 등록하기
            </h1>

            <button
              type="button"
              className={styles.submitButton}
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? '등록 중...' : '등록'}
            </button>
          </div>

          {submitError && <p role="alert">{submitError}</p>}
          <div className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">
                상품명
              </label>

              <input
                id="name"
                type="text"
                placeholder="상품명을 입력해주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? styles.errorInput : ''}
              />

              {errors.name && (
                <p className={styles.errorMessage}>
                  {errors.name}
                </p>
              )}

            </div>

            <div className={styles.field}>
              <label htmlFor="description">
                상품 소개
              </label>

              <textarea
                id="description"
                placeholder="상품 소개를 입력해주세요"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className={
                  errors.description
                    ? styles.errorInput
                    : ''
                }
              />

              {errors.description && (
                <p className={styles.errorMessage}>
                  {errors.description}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="price">
                판매가격
              </label>

              <input
                id="price"
                type="text"
                inputMode="numeric"
                placeholder="판매 가격을 입력해주세요"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className={
                  errors.price
                    ? styles.errorInput
                    : ''
                }
              />

              {errors.price && (
                <p className={styles.errorMessage}>
                  {errors.price}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="tag">
                태그
              </label>

              <input
                id="tag"
                type="text"
                placeholder="태그를 입력해주세요"
                value={tagInput}
                onChange={(e) =>
                  setTagInput(e.target.value)
                }
                onKeyDown={handleTagKeyDown}
                className={
                  errors.tag
                    ? styles.errorInput
                    : ''
                }
              />

              {errors.tag && (
                <p className={styles.errorMessage}>
                  {errors.tag}
                </p>
              )}
              <div className={styles.tagList}>
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className={styles.tag}
                  >
                    <span>#{tag}</span>

                    <button
                      type="button"
                      onClick={() => handleTagDelete(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default RegistrationPage;
