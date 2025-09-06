import { useTranslations } from 'next-intl';
import { ContactForm } from '@/components/ContactForm';
import { MotionFadeIn } from '@/components/MotionFadeIn';
import { generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  return generateSEOMetadata({
    title: 'Contact Us - TBS Group Handbag Division',
    description: 'Get in touch with TBS Group Handbag Division for consultation on premium handbag collections, custom solutions, and partnership opportunities.',
    keywords: ['contact', 'consultation', 'custom handbags', 'partnership', 'TBS Group'],
    locale,
    url: `/${locale}/contact`,
  });
}

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero Section */}
      <section className="section-spacing bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <MotionFadeIn>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-brand-primary mb-6">
              {t('title')}
            </h1>
            <div className="w-24 h-1 bg-brand-accent mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </MotionFadeIn>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section-spacing bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <MotionFadeIn delay={0.2}>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-primary mb-6">
                    Get in Touch
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    We're here to help you find the perfect handbag solution for your needs. 
                    Whether you're looking for custom designs, bulk orders, or have questions 
                    about our collections, our team is ready to assist you.
                  </p>
                </div>
              </MotionFadeIn>

              <MotionFadeIn delay={0.4}>
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-brand-accent text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-primary">Email</h3>
                      <p className="text-gray-600">info@tbs-handbag.com</p>
                      <p className="text-gray-600">sales@tbs-handbag.com</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-brand-accent text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-primary">Phone</h3>
                      <p className="text-gray-600">+84 (0) 123 456 789</p>
                      <p className="text-gray-600">+84 (0) 987 654 321</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-brand-accent text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-primary">Address</h3>
                      <p className="text-gray-600">
                        123 Fashion Street<br />
                        Hanoi, Vietnam<br />
                        100000
                      </p>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-brand-accent text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-primary">Business Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 9:00 AM - 5:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </MotionFadeIn>

              <MotionFadeIn delay={0.6}>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-brand-primary mb-4">Response Time</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We typically respond to inquiries within 24 hours during business days. 
                    For urgent matters, please call our hotline directly.
                  </p>
                </div>
              </MotionFadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}