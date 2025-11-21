import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/admin/AdminLayout';
import BlogEditor from '../../../../components/blog/BlogEditor';

export default function EditBlogPost() {
  const router = useRouter();
  const { id } = router.query;

  const handleSave = (post) => {
    // Stay on the same page after saving
    console.log('Post saved:', post);
  };

  const handleCancel = () => {
    router.push('/admin/blog');
  };

  if (!id) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-indigo-500 bg-white">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
        </div>
        
        <BlogEditor 
          postId={id}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </AdminLayout>
  );
}