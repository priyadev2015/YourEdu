import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { 
    Box, 
    Paper, 
    Typography, 
    Button, 
    TextField, 
    Avatar,
    IconButton,
    Chip,
    Divider,
    Menu,
    MenuItem,
    Tab,
    Tabs,
} from '@mui/material';
import { 
    ThumbUp as ThumbUpIcon,
    ChatBubbleOutline as CommentIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    EmojiEvents as TrophyIcon,
    Psychology as BrainIcon,
    Lightbulb as IdeaIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    AutoStories as BookIcon,
    Science as ScienceIcon,
    Delete as DeleteIcon,
    Sort as SortIcon,
} from '@mui/icons-material';
import { FaHashtag } from 'react-icons/fa';
import { 
    fetchPosts, 
    createPost, 
    saveDraft, 
    fetchDrafts,
    deleteDraft,
    addComment,
    toggleLike,
    toggleFavorite,
    fetchFavorites,
    deletePost
} from '../../utils/supabase/community';

const categories = [
    'All',
    'General',
    'Getting Started',
    'Dual Enrollment',
    'College',
    'AP Courses',
    'Resources'
];

const avatarIcons = [
    { icon: PersonIcon, name: 'Person', color: '#00356b' },
    { icon: SchoolIcon, name: 'School', color: '#2563eb' },
    { icon: TrophyIcon, name: 'Trophy', color: '#7c3aed' },
    { icon: BrainIcon, name: 'Brain', color: '#db2777' },
    { icon: IdeaIcon, name: 'Idea', color: '#ea580c' },
    { icon: BookIcon, name: 'Book', color: '#059669' },
    { icon: ScienceIcon, name: 'Science', color: '#475569' },
];

const QandASection = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [favoritedPosts, setFavoritedPosts] = useState(new Set());
    const [showComments, setShowComments] = useState(new Set());
    const [commentInputs, setCommentInputs] = useState({});
    const [displayName, setDisplayName] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [drafts, setDrafts] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [sortBy, setSortBy] = useState('recent');
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await fetchPosts(selectedCategory, sortBy);
            setPosts(data);

            // Set initial liked and favorited states
            const newLiked = new Set();
            data.forEach(post => {
                if (post.isLiked) {
                    newLiked.add(post.id);
                }
            });
            setLikedPosts(newLiked);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserProfile();
            loadPosts();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadPosts();
        }
    }, [selectedCategory, sortBy, user?.id]);

    const fetchUserProfile = async () => {
        try {
            const { data: profile, error } = await supabase
                .from('account_profiles')
                .select('name, profile_picture')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (profile) {
                setDisplayName(profile.name || user.email?.split('@')[0] || 'Anonymous');
                setProfileImage(profile.profile_picture || '');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    useEffect(() => {
        const loadDrafts = async () => {
            if (currentTab === 1) {
                try {
                    setLoading(true);
                    const data = await fetchDrafts();
                    setDrafts(data);
                } catch (error) {
                    console.error('Error loading drafts:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadDrafts();
    }, [currentTab]);

    useEffect(() => {
        const loadFavorites = async () => {
            if (currentTab === 2) {
                try {
                    setLoading(true);
                    const data = await fetchFavorites();
                    setPosts(data);
                } catch (error) {
                    console.error('Error loading favorites:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadFavorites();
    }, [currentTab]);

    const handlePostSubmit = async (e, isDraft = false) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        const hashtagRegex = /#[a-zA-Z0-9]+/g;
        const extractedHashtags = newPost.match(hashtagRegex) || [];
        
        try {
            setLoading(true);
            if (isDraft) {
                const draft = await saveDraft(
                    newPost,
                    selectedCategory,
                    extractedHashtags.map(tag => tag.slice(1))
                );
                setDrafts([draft, ...drafts]);
            } else {
                const post = await createPost(
                    newPost,
                    selectedCategory,
                    extractedHashtags.map(tag => tag.slice(1))
                );
                setPosts([post, ...posts]);
            }
            setNewPost('');
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        if (likedPosts.has(postId)) return; // Prevent multiple likes

        try {
            // Optimistically update UI
            setLikedPosts(prev => {
                const newLiked = new Set(prev);
                newLiked.add(postId);
                return newLiked;
            });

            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: (typeof post.likes === 'number' ? post.likes : 0) + 1,
                        isLiked: true
                    };
                }
                return post;
            }));

            // Make API call
            const isLiked = await toggleLike(postId);
            
            // If API call fails, revert changes
            if (!isLiked) {
                setLikedPosts(prev => {
                    const newLiked = new Set(prev);
                    newLiked.delete(postId);
                    return newLiked;
                });

                setPosts(prevPosts => prevPosts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            likes: Math.max(0, (typeof post.likes === 'number' ? post.likes : 0) - 1),
                            isLiked: false
                        };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert changes on error
            setLikedPosts(prev => {
                const newLiked = new Set(prev);
                newLiked.delete(postId);
                return newLiked;
            });

            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: Math.max(0, (typeof post.likes === 'number' ? post.likes : 0) - 1),
                        isLiked: false
                    };
                }
                return post;
            }));
        }
    };

    const handleFavorite = async (postId) => {
        try {
            const isFavorited = await toggleFavorite(postId);
            setFavoritedPosts(prev => {
                const newFavorited = new Set(prev);
                if (isFavorited) {
                    newFavorited.add(postId);
                } else {
                    newFavorited.delete(postId);
                }
                return newFavorited;
            });
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handlePublishDraft = async (draft) => {
        try {
            setLoading(true);
            const post = await createPost(draft.content, draft.category, draft.hashtags);
            await deleteDraft(draft.id);
            setPosts([post, ...posts]);
            setDrafts(drafts.filter(d => d.id !== draft.id));
        } catch (error) {
            console.error('Error publishing draft:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDraft = async (draftId) => {
        try {
            await deleteDraft(draftId);
            setDrafts(drafts.filter(d => d.id !== draftId));
        } catch (error) {
            console.error('Error deleting draft:', error);
        }
    };

    const toggleComments = (postId) => {
        setShowComments(prev => {
            const newShow = new Set(prev);
            if (newShow.has(postId)) {
                newShow.delete(postId);
            } else {
                newShow.add(postId);
            }
            return newShow;
        });
    };

    const handleCommentInput = (postId, value) => {
        setCommentInputs(prev => ({
            ...prev,
            [postId]: value
        }));
    };

    const handleComment = async (postId) => {
        if (!commentInputs[postId]?.trim()) return;

        try {
            const comment = await addComment(postId, commentInputs[postId]);
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: [...(post.comments || []), comment],
                        comment_count: (post.comment_count || 0) + 1
                    };
                }
                return post;
            }));

            setCommentInputs(prev => ({
                ...prev,
                [postId]: ''
            }));
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const sortPosts = (postsToSort) => {
        return [...postsToSort].sort((a, b) => {
            switch (sortBy) {
                case 'likes':
                    return b.likes - a.likes;
                case 'comments':
                    return b.commentCount - a.commentCount;
                case 'recent':
                default:
                    return b.timestamp - a.timestamp;
            }
        });
    };

    const getFilteredPosts = () => {
        let filtered = posts;
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(post => 
                post.category === selectedCategory ||
                post.hashtags.includes(selectedCategory.toLowerCase().replace(/\s+/g, ''))
            );
        }
        return sortPosts(filtered);
    };

    const handleDeletePost = async (postId) => {
        try {
            await deletePost(postId);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const renderPostList = (postsToRender) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {postsToRender.map(post => (
                <Paper 
                    key={post.id} 
                    elevation={0}
                    sx={{ 
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                            src={post.author?.profile_picture}
                            alt={post.author?.name}
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'hsl(var(--brand-primary))',
                                mr: 1
                            }}
                        >
                            {post.author?.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    color: '#2d3748', 
                                    fontWeight: 600,
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                {post.author?.name || 'Anonymous'}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: '#718096',
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                {new Date(post.created_at).toLocaleDateString()}
                            </Typography>
                        </Box>
                        {currentTab === 1 ? (
                            <Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handlePublishDraft(post)}
                                    sx={{
                                        mr: 1,
                                        color: '#00356b',
                                        borderColor: '#00356b',
                                    }}
                                >
                                    Publish
                                </Button>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteDraft(post.id)}
                                    sx={{ color: '#718096' }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ) : post.user_id === user?.id && (
                            <IconButton
                                size="small"
                                onClick={() => handleDeletePost(post.id)}
                                sx={{ 
                                    color: '#718096',
                                    '&:hover': {
                                        color: '#dc2626',
                                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                    }
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>

                    <Typography 
                        sx={{ 
                            mb: 2, 
                            color: '#2d3748',
                            fontSize: '1rem',
                            lineHeight: 1.7,
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        {post.content}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        {post.hashtags.map(tag => (
                            <Chip
                                key={tag}
                                icon={<FaHashtag />}
                                label={tag}
                                size="small"
                                onClick={() => setSelectedCategory(tag)}
                                sx={{
                                    backgroundColor: 'rgba(0, 53, 107, 0.1)',
                                    color: '#00356b',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    '& .MuiChip-icon': {
                                        color: '#00356b',
                                    },
                                }}
                            />
                        ))}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            onClick={() => handleLike(post.id)}
                            startIcon={<ThumbUpIcon />}
                            sx={{
                                color: likedPosts.has(post.id) ? '#00356b' : '#718096',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 53, 107, 0.08)',
                                },
                                textTransform: 'none',
                            }}
                        >
                            {`${typeof post.likes === 'number' ? post.likes : 0} Likes`}
                        </Button>
                        <Button
                            onClick={() => toggleComments(post.id)}
                            startIcon={<CommentIcon />}
                            sx={{
                                color: '#718096',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 53, 107, 0.08)',
                                },
                                textTransform: 'none',
                            }}
                        >
                            {`${post.comment_count || 0} Comments`}
                        </Button>
                        <IconButton
                            onClick={() => handleFavorite(post.id)}
                            sx={{
                                color: favoritedPosts.has(post.id) ? '#00356b' : '#718096',
                                ml: 'auto',
                            }}
                        >
                            {favoritedPosts.has(post.id) ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                    </Box>

                    {showComments.has(post.id) && (
                        <Box sx={{ mt: 2 }}>
                            {post.comments?.map(comment => (
                                <Box 
                                    key={comment.id} 
                                    sx={{ 
                                        mb: 2, 
                                        pl: 2, 
                                        borderLeft: '2px solid #e2e8f0',
                                        backgroundColor: 'rgba(0, 53, 107, 0.02)',
                                        borderRadius: '0 8px 8px 0',
                                        py: 2,
                                        px: 2
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Avatar
                                            src={comment.commenter?.profile_picture}
                                            alt={comment.commenter?.name}
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                bgcolor: 'hsl(var(--brand-primary))',
                                                mr: 1
                                            }}
                                        >
                                            {comment.commenter?.name?.charAt(0)}
                                        </Avatar>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                ml: 1,
                                                color: '#2d3748',
                                                fontWeight: 600,
                                                fontFamily: "'Inter', sans-serif",
                                            }}
                                        >
                                            {comment.commenter?.name || 'Anonymous'}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                ml: 1, 
                                                color: '#718096',
                                                fontFamily: "'Inter', sans-serif",
                                            }}
                                        >
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography 
                                        sx={{ 
                                            color: '#4a5568',
                                            fontSize: '0.9375rem',
                                            lineHeight: 1.6,
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    >
                                        {comment.content}
                                    </Typography>
                                </Box>
                            ))}
                            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Write a comment..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => handleCommentInput(post.id, e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '& fieldset': {
                                                borderColor: '#e2e8f0',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#00356b',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#00356b',
                                            },
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => handleComment(post.id)}
                                    sx={{
                                        backgroundColor: '#00356b',
                                        color: 'white',
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        px: 3,
                                        '&:hover': {
                                            backgroundColor: '#002548',
                                        },
                                    }}
                                >
                                    Post
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            ))}
        </Box>
    );

    return (
        <Box>
            {/* Categories and Sort */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2,
                }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: '#2d3748',
                            fontWeight: 600,
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        Categories
                    </Typography>
                    <Button
                        startIcon={<SortIcon />}
                        onClick={(e) => setSortAnchorEl(e.currentTarget)}
                        sx={{
                            color: '#718096',
                            textTransform: 'none',
                        }}
                    >
                        Sort by
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "contained" : "outlined"}
                            size="medium"
                            onClick={() => setSelectedCategory(category)}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                backgroundColor: selectedCategory === category ? '#00356b' : 'transparent',
                                borderColor: '#00356b',
                                color: selectedCategory === category ? 'white' : '#00356b',
                                px: 2,
                                py: 1,
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                '&:hover': {
                                    backgroundColor: selectedCategory === category ? '#002548' : 'rgba(0, 53, 107, 0.08)',
                                    borderColor: '#00356b',
                                },
                            }}
                        >
                            {category}
                        </Button>
                    ))}
                </Box>
            </Paper>

            {/* Tabs */}
            <Box sx={{ mb: 3 }}>
                <Tabs 
                    value={currentTab} 
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#00356b',
                        },
                    }}
                >
                    <Tab 
                        label="Posts" 
                        sx={{
                            textTransform: 'none',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            color: '#718096',
                            '&.Mui-selected': {
                                color: '#00356b',
                            },
                        }}
                    />
                    <Tab 
                        label="Drafts" 
                        sx={{
                            textTransform: 'none',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            color: '#718096',
                            '&.Mui-selected': {
                                color: '#00356b',
                            },
                        }}
                    />
                    <Tab 
                        label="Favorites" 
                        sx={{
                            textTransform: 'none',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            color: '#718096',
                            '&.Mui-selected': {
                                color: '#00356b',
                            },
                        }}
                    />
                </Tabs>
            </Box>

            {/* New Post Form */}
            {currentTab === 0 && (
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3, 
                        mb: 3, 
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <Box component="form" onSubmit={handlePostSubmit}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Share your thoughts or ask a question... Use #hashtags for categories!"
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: '#e2e8f0',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#00356b',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#00356b',
                                    },
                                },
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                startIcon={<SaveIcon />}
                                onClick={(e) => handlePostSubmit(e, true)}
                                sx={{
                                    color: '#718096',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: 'rgba(113, 128, 150, 0.08)',
                                    },
                                }}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!newPost.trim()}
                                sx={{
                                    backgroundColor: '#00356b',
                                    color: 'white',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1,
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    '&:hover': {
                                        backgroundColor: '#002548',
                                    },
                                    '&.Mui-disabled': {
                                        backgroundColor: '#e2e8f0',
                                    },
                                }}
                            >
                                Post
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            )}

            {/* Content based on current tab */}
            {currentTab === 0 && renderPostList(getFilteredPosts())}
            {currentTab === 1 && renderPostList(drafts)}
            {currentTab === 2 && renderPostList(posts.filter(post => favoritedPosts.has(post.id)))}

            {/* Sort Menu */}
            <Menu
                anchorEl={sortAnchorEl}
                open={Boolean(sortAnchorEl)}
                onClose={() => setSortAnchorEl(null)}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 180,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        borderRadius: 2,
                    },
                }}
            >
                <MenuItem 
                    onClick={() => {
                        setSortBy('recent');
                        setSortAnchorEl(null);
                    }}
                    sx={{
                        color: sortBy === 'recent' ? '#00356b' : '#2d3748',
                        fontWeight: sortBy === 'recent' ? 600 : 400,
                    }}
                >
                    Most Recent
                </MenuItem>
                <MenuItem 
                    onClick={() => {
                        setSortBy('likes');
                        setSortAnchorEl(null);
                    }}
                    sx={{
                        color: sortBy === 'likes' ? '#00356b' : '#2d3748',
                        fontWeight: sortBy === 'likes' ? 600 : 400,
                    }}
                >
                    Most Liked
                </MenuItem>
                <MenuItem 
                    onClick={() => {
                        setSortBy('comments');
                        setSortAnchorEl(null);
                    }}
                    sx={{
                        color: sortBy === 'comments' ? '#00356b' : '#2d3748',
                        fontWeight: sortBy === 'comments' ? 600 : 400,
                    }}
                >
                    Most Commented
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default QandASection; 