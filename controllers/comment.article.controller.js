//import { items } from '../data/testdata.js';
import { prisma } from '../db.js';
//댓글 등록
export const createComment = async (req, res) => {
    try {
        console.log('payload : ', req.body);

        const { content, articleId } = req.body;

        if (!content) {
            return res.status(400).json({
                message: "내용은 필수로 입력해주십시오"
            });
        }
        else if (!articleId) {
            return res.status(400).json({
                message: "댓글들 달 게시글의 id가 지정되지 않았습니다"
            });
        }
        const comment = await prisma.comment.create({
            data: {
                content, articleId
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.log("createComment 에러 :", error);

        res.status(500).json({
            message: "댓글 등록 실패"
        })
    }

};

// 댓글조회
export const loadComments = async (req, res) => {
    try {
        let { articleId, cursor, limit } = req.query;
        articleId = Number(articleId);
        limit = Number(limit) || 10;
        const comments = await prisma.comment.findMany({
            where : {
                articleId : articleId,
                id : {
                    lt : Number(cursor)
                }
            },
            orderBy : {
                id : 'desc'
            },
            take : limit
        });
        if(!articleId){
            return res.status(400).json({
                message : "게시글 아이디 미지정"
            })
        }
        return res.json(comments);
        

    } catch (error) {
        console.error("loadComments 에러 :", error);

        return res.status(500).json({
            message: "댓글을 불러오는데 실패했습니다."
        });
    }
};
//댓글 수정
export const editComment = async (req, res) => {
   try {
        const comment = await prisma.comment.update({
            where: {
                id: Number(req.params.id)
            },
            data: req.body
        });

        return res.json(comment);

    } catch (error) {
        console.log("editComment 에러 :", error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                message: "존재하지 않는 댓글입니다."
            });
        }

        return res.status(500).json({
            message: "댓글 수정 실패"
        });
    }
};
//댓글 삭제
export const removeComment = async (req, res) => {
     try {
           const comment = await prisma.comment.delete({
               where: {
                   id : Number(req.params.id)
               }
           })
   
           console.log("댓글 아이디 ", req.params.id);
   
           if (!comment) {
               res.status(404).json({
                   message: "존재하지 않는 댓글입니다."
               })
               return;
           };
           return res.json(comment);
       } catch (error) {
           console.log("removerComment 에러 :", error);
           return res.status(500).json({
               message: "댓글을 삭제하는데 실패했습니다."
           });
       }
   
}
