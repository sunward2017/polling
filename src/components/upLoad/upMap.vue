<template>
	<el-upload class="upload-content" drag ref='upload' :action="url" :auto-upload="false" :before-upload="handlePreview" :on-success="handleSuccess" :on-error="handleError" :data="param">
		<i class="el-icon-upload"></i>
		<div class="el-upload__text">将文件拖到此处，或<em>选取文件</em></div>
		<div class="el-upload_tip" slot="tip">只能上传{{strRegExp.split("|").join("或")}}文件</div>
	</el-upload>

</template>
<script>
	export default {
		props: {
			param: {
				type: Object,
			},
			strRegExp: {
				type: String,
				default: ''
			},
			url: {
				type: String
			}
		},
		data() {
			return {
				fileList: [],
			};
		},
		methods: {
			handlePreview(file) {
				var reg = new RegExp(this.strRegExp);
				if(reg.test(file.name.toUpperCase())) {
					return true;
				} else {
					this.$notify.info({
						title: '提示',
						message: '文件格式不正确',
						duration: 2000,
						offset: 300
					});
					return false;
				}

			},
			handleSuccess(response, file, fileList) {
				if(response.result == 200) {
					this.$notify.success({
						title: '成功',
						message: '文件上传成功',
						duration: 2000,
						offset: 300
					});
					fileList = [];
					this.$emit('callback')
				}

			},
			handleError(e, file, fileList) {
				this.$notify.error({
					title: '失败',
					message: '文件上传失败',
					duration: 2000,
					offset: 300
				});
			},
			submit() {
				this.$refs.upload.submit();
			}
		},

	}
</script>
<style scoped>

</style>