//import { items } from '../data/testdata.js';
import { prisma } from '../db.js';
//댓글 등록
export const createComment = async (req, res) => {
    try {
        console.log('payload : ', req.body);

        const { content, productId } = req.body;

        if (!content) {
            return res.status(400).json({
                message: "내용은 필수로 입력해주십시오"
            });
        }
        else if (!productId) {
            return res.status(400).json({
                message: "댓글들 달 상품의 id가 지정되지 않았습니다"
            });
        }
        const comment = await prisma.commentProduct.create({
            data: {
                content,  productId
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.log("createComment (product) 에러 :", error);

        res.status(500).json({
            message: "댓글 등록 실패"
        })
    }

};

// 댓글조회
export const loadComments = async (req, res) => {
    try {
        let { productId, cursor, limit } = req.query;
        productId = Number(productId);
        limit = Number(limit) || 10;
        const comments = await prisma.commentProduct.findMany({
            where : {
                productId : productId,
                id : {
                    lt : Number(cursor)
                }
            },
            orderBy : {
                id : 'desc'
            },
            take : limit
        });
        if(!productId){
            return res.status(400).json({
                message : "상품 아이디 미지정"
            })
        }
        return res.json(comments);
        

    } catch (error) {
        console.error("loadComments (product)에러 :", error);

        return res.status(500).json({
            message: "댓글을 불러오는데 실패했습니다."
        });
    }
};
//댓글 수정
export const editComment = async (req, res) => {
   try {
        const comment = await prisma.commentProduct.update({
            where: {
                id: Number(req.params.id)
            },
            data: req.body
        });

        return res.json(comment);

    } catch (error) {
        console.log("editComment (products)에러 :", error);

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
           const comment = await prisma.commentProduct.delete({
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
           console.log("removerComment (product)에러 :", error);
           return res.status(500).json({
               message: "댓글을 삭제하는데 실패했습니다."
           });
       }
   
}
