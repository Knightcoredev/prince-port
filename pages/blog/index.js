import Head from 'next/head';
import BlogList from '../../components/blog/BlogList';

export default function BlogIndex() {
  return (
    <>
      <Head>
        <title>Blog - Prince F. Obieze</title>
        <meta name="description" content="Insights, tutorials, and thoughts on web development, technology, and design." />
        <meta property="og:title" content="Blog - Prince F. Obieze" />
        <meta property="og:description" content="Insights, tutorials, and thoughts on web development, technology, and design." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog - Prince F. Obieze" />
        <meta name="twitter:description" content="Insights, tutorials, and thoughts on web development, technology, and design." />
      </Head>
      
      <BlogList />
    </>
  );
}