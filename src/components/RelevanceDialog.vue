<template>
    <div class="dialog-container">
        <el-row>
            <span class="dialog-title" v-if="drawing">Finalise drawing</span>
            <span class="dialog-title" v-else>Visualise relevance</span>
            <el-row v-if="drawing">
                <el-col :span="13">
                    <el-button type="primary" plain @click="$emit('confirm', true)">
                        Confirm
                    </el-button>
                </el-col>
                <el-col :span="11">
                    <el-button type="primary" plain @click="$emit('cancel', true)">
                        Cancel
                    </el-button>
                </el-col>
            </el-row>
            <el-row v-else>
                <el-button type="primary" plain @click="$emit('display', false)">
                    Close
                </el-button>
            </el-row>
        </el-row>
        <el-row v-if="relevance">
            <el-row>
                <el-col :span="23">
                    <b><span>Related Features</span></b>
                </el-col>
                <el-col :span="1">
                    <el-icon><el-icon-circle-close @click="$emit('popup', true)" /></el-icon>
                </el-col>
            </el-row>
            <el-card shadow="hover" v-for="(value, key) in entry" :key="key" @click="$emit('tooltip', value)">
                <span>{{ key }}</span>
            </el-card>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { CircleClose as ElIconCircleClose } from '@element-plus/icons-vue'
import {
    ElRow as Row,
    ElCol as Col,
    ElCard as Card
} from 'element-plus'

export default {
    name: 'RelevanceDialog',
    components: {
        Row,
        Col,
        Card
    },
    props: {
        entry: {
            type: Object,
        },
        drawing: {
            type: Boolean,
            default: false,
        },
        relevance: {
            type: Boolean,
            default: false,
        }
    },
}
</script>

<style lang="scss" scoped>
.dialog-container {
    width: 200px;
    height: fit-content;
    text-align: justify;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    background: #fff;
    border: 1px solid $app-primary-color;
    display: flex;
    flex-direction: column;
    padding: 1em 5px 1em 5px;
}

.dialog-title {
    font-size: 18px;
    font-weight: bold;
    color: rgb(131, 0, 191);
}

.el-icon {
    cursor: pointer;
}

:deep(.el-card) {
    --el-card-padding: 8px;
    border: 0;
    cursor: pointer;
}
</style>