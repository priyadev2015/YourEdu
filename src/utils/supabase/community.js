import { supabase } from '../supabaseClient';

// Posts
export const fetchPosts = async (category = 'All', sortBy = 'recent') => {
    console.log('Fetching posts with params:', { category, sortBy });
    
    // Now try the full query
    let query = supabase
        .from('posts')
        .select(`
            *,
            author:account_profiles!user_id (
                name,
                profile_picture
            ),
            comments:post_comments (
                id,
                content,
                created_at,
                user_id,
                commenter:account_profiles!user_id (
                    name,
                    profile_picture
                )
            ),
            likes:post_likes (
                user_id
            )
        `);

    if (category !== 'All') {
        query = query.eq('category', category);
    }

    switch (sortBy) {
        case 'likes':
            query = query.order('like_count', { ascending: false });
            break;
        case 'comments':
            query = query.order('comment_count', { ascending: false });
            break;
        case 'recent':
        default:
            query = query.order('created_at', { ascending: false });
    }

    console.log('Executing full query...');
    const { data, error } = await query;
    console.log('Full query result:', { data, error });

    if (error) {
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
        });
        throw error;
    }

    // Transform the data to include like count and user's like status
    const { data: { user } } = await supabase.auth.getUser();
    return data?.map(post => ({
        ...post,
        likes: post.like_count || 0,
        isLiked: Array.isArray(post.likes) && post.likes.some(like => like.user_id === user?.id) || false
    }));
};

export const createPost = async (content, category, hashtags) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First get the user's profile
    const { data: profile } = await supabase
        .from('account_profiles')
        .select('name, profile_picture')
        .eq('id', user.id)
        .single();

    // Create the post
    const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
            content,
            category,
            hashtags,
            user_id: user.id,
            like_count: 0,
            comment_count: 0
        })
        .select(`
            *,
            author:account_profiles!user_id (
                name,
                profile_picture
            )
        `)
        .single();

    if (postError) throw postError;

    return {
        ...post,
        likes: 0,
        isLiked: false,
        comments: []
    };
};

export const saveDraft = async (content, category, hashtags) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get the user's profile
    const { data: profile } = await supabase
        .from('account_profiles')
        .select('name, profile_picture')
        .eq('id', user.id)
        .single();

    const { data, error } = await supabase
        .from('post_drafts')
        .insert({
            content,
            category,
            hashtags,
            user_id: user.id
        })
        .select(`
            *,
            author:account_profiles!user_id (
                name,
                profile_picture
            )
        `)
        .single();

    if (error) throw error;
    return {
        ...data,
        likes: 0,
        isLiked: false,
        comments: []
    };
};

export const fetchDrafts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('post_drafts')
        .select(`
            *,
            author:account_profiles!user_id (
                name,
                profile_picture
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(draft => ({
        ...draft,
        likes: 0,
        isLiked: false,
        comments: []
    }));
};

export const deleteDraft = async (draftId) => {
    const { error } = await supabase
        .from('post_drafts')
        .delete()
        .eq('id', draftId);

    if (error) throw error;
};

// Comments
export const addComment = async (postId, content) => {
    console.log('Adding comment:', { postId, content });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Current user:', user);

    const { data, error } = await supabase
        .from('post_comments')
        .insert({
            post_id: postId,
            content,
            user_id: user.id
        })
        .select(`
            *,
            commenter:account_profiles!user_id (
                name,
                profile_picture
            )
        `)
        .single();

    console.log('Comment creation result:', { data, error });

    if (error) {
        console.error('Error adding comment:', error);
        throw error;
    }

    try {
        await supabase.rpc('increment_comment_count', { post_id: postId });
        console.log('Comment count incremented successfully');
    } catch (rpcError) {
        console.error('Error incrementing comment count:', rpcError);
    }

    return data;
};

// Likes
export const toggleLike = async (postId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already liked
    const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existingLike) {
        // Unlike - this shouldn't happen in normal flow now
        const { error: deleteError } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
            
        if (deleteError) throw deleteError;

        const { error: decrementError } = await supabase.rpc('decrement_like_count', { post_id: postId });
        if (decrementError) throw decrementError;

        return false;
    } else {
        // Like
        const { error: insertError } = await supabase
            .from('post_likes')
            .insert({
                post_id: postId,
                user_id: user.id
            });
            
        if (insertError) throw insertError;

        const { error: incrementError } = await supabase.rpc('increment_like_count', { post_id: postId });
        if (incrementError) throw incrementError;

        return true;
    }
};

// Favorites
export const toggleFavorite = async (postId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already favorited
    const { data: existingFavorite } = await supabase
        .from('post_favorites')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existingFavorite) {
        // Unfavorite
        const { error } = await supabase
            .from('post_favorites')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);

        if (error) throw error;
        return false;
    } else {
        // Favorite
        const { error } = await supabase
            .from('post_favorites')
            .insert({
                post_id: postId,
                user_id: user.id
            });

        if (error) throw error;
        return true;
    }
};

export const fetchFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: favorites } = await supabase
        .from('post_favorites')
        .select('post_id')
        .eq('user_id', user.id);

    if (!favorites?.length) return [];

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:account_profiles!user_id (
                name,
                profile_picture
            ),
            comments:post_comments (
                id,
                content,
                created_at,
                user_id,
                commenter:account_profiles!user_id (
                    name,
                    profile_picture
                )
            ),
            likes:post_likes (
                user_id
            )
        `)
        .in('id', favorites.map(f => f.post_id))
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(post => ({
        ...post,
        likes: post.like_count || 0,
        isLiked: Array.isArray(post.likes) && post.likes.some(like => like.user_id === user?.id) || false
    }));
};

// Profile
export const updateAvatar = async (avatarIcon, avatarColor) => {
    console.log('Updating avatar:', { avatarIcon, avatarColor });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Current user:', user);

    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
        .from('account_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    console.log('Profile check:', { existingProfile, checkError });

    if (!existingProfile) {
        console.log('Creating new profile...');
        const { data: newProfile, error: insertError } = await supabase
            .from('account_profiles')
            .insert({
                id: user.id,
                name: user.email?.split('@')[0] || 'Anonymous',
                avatar_icon: avatarIcon,
                avatar_color: avatarColor
            })
            .select('*')
            .single();

        console.log('New profile result:', { newProfile, insertError });
        if (insertError) throw insertError;
        return newProfile;
    } else {
        console.log('Updating existing profile...');
        const { data: updatedProfile, error: updateError } = await supabase
            .from('account_profiles')
            .update({ 
                avatar_icon: avatarIcon,
                avatar_color: avatarColor
            })
            .eq('id', user.id)
            .select('*')
            .single();

        console.log('Profile update result:', { updatedProfile, updateError });
        if (updateError) throw updateError;
        return updatedProfile;
    }
};

// Add delete post function
export const deletePost = async (postId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First verify the user owns this post
    const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

    if (!post || post.user_id !== user.id) {
        throw new Error('Not authorized to delete this post');
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) throw error;
}; 