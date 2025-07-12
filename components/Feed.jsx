"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { details } from '../data/data';
import { Image } from 'lucide-react';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setIsLoading] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageIconClick = () => {
        fileInputRef.current.click(); // Trigger the hidden file input
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // set preview URL
        }
    };

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error) setPosts(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!newPost.trim() && !imageFile) {
                return;
            }

            let imageUrl = null;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `uploads/${fileName}`;

                const { error: uploadError } = await supabase
                    .storage
                    .from('post-images')
                    .upload(filePath, imageFile);

                if (uploadError) {
                    console.error('Upload error:', uploadError.message);
                    return;
                }

                const { data: publicUrlData, error: urlError } = await supabase
                    .storage
                    .from('post-images')
                    .getPublicUrl(filePath);

                if (urlError) {
                    console.error('Public URL error:', urlError.message);
                    return;
                }

                imageUrl = publicUrlData.publicUrl;
            }

            const { error } = await supabase.from('posts').insert([{
                body: newPost,
                image_url: imageUrl,
            }]);

            if (error) {
                console.error('Insert error:', error.message);
                return;
            }

            // Clear form
            setNewPost('');
            setImageFile(null);
            setPreviewUrl(null);
            fetchPosts();
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, []);

    useEffect(() => {
        if (!previewUrl) return;

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        fetchPosts()

        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
                fetchPosts()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <div className="w-full mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">🧱 Wall</h1>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
                <div className='flex flex-col flex-1 gap-6 border rounded px-6 py-4'>
                    <input
                        className="flex-1 focus:outline-none focus:ring-0 focus:border-transparent"
                        placeholder="What's on your mind?"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                    />
                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-30 w-fit rounded border border-gray-300"
                        />
                    )}
                    <div className='flex justify-between items-center'>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleImageIconClick}
                                className="hover:opacity-70"
                                title="Upload an image"
                            >
                                <Image className="w-6 h-6 text-blue-500" />
                            </button>

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }} // hide the actual file input
                            />
                        </div>
                        
                        <button
                            className="bg-blue-500 text-white px-4 py-2 w-fit rounded hover:cursor-pointer hover:opacity-80"
                            type="submit"
                        >
                            {loading ? "Processing..." : "Share"}
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="border p-4 rounded shadow-sm">
                        <p className="font-semibold text-lg">
                            {details.name}
                        </p>
                        <p className='font-normal text-md'>
                            {post.body}
                        </p>
                        {post.image_url && (
                            <img src={post.image_url} alt="Post image" className="mt-2 rounded max-h-60" />
                        )}
                        <span className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}