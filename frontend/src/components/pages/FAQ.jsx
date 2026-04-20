import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Delivery & Shipping',
      questions: [
        {
          q: 'What are the shipping charges?',
          a: 'We offer FREE shipping on all orders above ₹1000. For orders below ₹1000, a flat shipping charge of ₹50 applies across India.',
        },
        {
          q: 'How long does delivery take?',
          a: 'Standard delivery takes 5-7 business days. For metro cities, delivery is usually within 3-5 days. Custom orders may take 4-6 weeks depending on complexity.',
        },
        {
          q: 'Do you ship internationally?',
          a: 'Currently, we only ship within India. We are working on expanding our international shipping soon. Please check back later!',
        },
        {
          q: 'Can I track my order?',
          a: 'Yes! Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order from your account dashboard.',
        },
      ],
    },
    {
      category: 'Returns & Refunds',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 7-day return policy from the date of delivery. Products must be unused, unwashed, and in original packaging with tags intact.',
        },
        {
          q: 'How do I initiate a return?',
          a: 'Contact our customer support team via email or phone with your order number. We will arrange a pickup and process your return within 3-5 business days.',
        },
        {
          q: 'When will I receive my refund?',
          a: 'Refunds are processed within 7-10 business days after we receive and inspect the returned product. The amount will be credited to your original payment method.',
        },
        {
          q: 'Can I exchange a product?',
          a: 'Yes, exchanges are allowed within 7 days for size or color variations. Please contact us to arrange an exchange.',
        },
      ],
    },
    {
      category: 'Product Care',
      questions: [
        {
          q: 'How do I wash handloom products?',
          a: 'We recommend hand washing or gentle machine wash in cold water. Use mild detergent and avoid bleach. Air dry in shade to maintain color and fabric quality.',
        },
        {
          q: 'Can I iron handloom products?',
          a: 'Yes, you can iron handloom products on low to medium heat. For best results, iron while slightly damp or use a damp cloth between the iron and fabric.',
        },
        {
          q: 'How do I remove stains?',
          a: 'For stubborn stains, gently dab with cold water and mild soap. Avoid rubbing vigorously. For delicate items like silk, we recommend professional dry cleaning.',
        },
        {
          q: 'How long do handloom products last?',
          a: 'With proper care, handloom products can last for many years. The natural fibers and handcrafted quality make them more durable than machine-made alternatives.',
        },
      ],
    },
    {
      category: 'Handloom Education',
      questions: [
        {
          q: 'What is the difference between handloom and powerloom?',
          a: 'Handloom products are woven manually on traditional looms by skilled artisans, making each piece unique. Powerloom products are machine-made and lack the character and quality of handloom.',
        },
        {
          q: 'Why are handloom products more expensive?',
          a: 'Handloom products require skilled craftsmanship, time, and premium natural materials. Each piece is unique and supports artisan livelihoods. The quality and durability justify the price.',
        },
        {
          q: 'Are your products 100% handmade?',
          a: 'Yes! All our products are 100% handwoven by skilled artisans using traditional techniques. We never use power looms or machines for weaving.',
        },
        {
          q: 'What fabrics do you use?',
          a: 'We primarily use natural fibers like cotton, silk, wool, and linen. All materials are sourced ethically and are eco-friendly and biodegradable.',
        },
      ],
    },
    {
      category: 'Orders & Payments',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'Currently, we accept Cash on Delivery (COD) for all orders. We are working on integrating online payment methods soon.',
        },
        {
          q: 'Can I cancel my order?',
          a: 'Yes, you can cancel your order before it is shipped. Once shipped, cancellation is not possible, but you can return the product after delivery.',
        },
        {
          q: 'Do you offer bulk order discounts?',
          a: 'Yes! We offer attractive discounts on bulk orders. Please contact us with your requirements for a custom quote.',
        },
        {
          q: 'Can I modify my order after placing it?',
          a: 'Order modifications are possible only if the order has not been processed for shipping. Please contact us immediately if you need to make changes.',
        },
      ],
    },
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Find answers to common questions about our products and services
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openIndex === index;

                  return (
                    <div
                      key={questionIndex}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
                    >
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full flex justify-between items-start gap-4 text-left py-2 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {faq.q}
                        </span>
                        {isOpen ? (
                          <FiChevronUp className="w-5 h-5 flex-shrink-0 text-saffron-600 dark:text-saffron-400" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-gradient-to-r from-saffron-600 to-golden-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="mb-6">
            Cannot find the answer you are looking for? Our customer support team is here to help!
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-saffron-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;