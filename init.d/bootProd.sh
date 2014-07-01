#! /bin/sh -e
set -e
workflow=/data0/koa-jade-workflow
log=$workflow"/log/workflow-webo.log"
out=$workflow"/log/workflow-webo-out.log"
errlog=$workflow"/log/workflow-webo-err.log"
ignore=$workflow"/.foreverignoreProd"
cd $workflow

case "$1" in
    start)
            forever start -c "node --harmony"  -l $log -a -e $errlog -a -o $out -a -w --watchDirectory './' --watchIgnore $ignore $workflow;;
    stop)
            forever stopall;;
    force-reload | restart)
            forever stopall;
            forever start -c "node --harmony"  -l $log -a -e $errlog -a -o $out -a -w --watchDirectory './' --watchIgnore $ignore $workflow;;
    *)
            echo "Usage boot {start | stop | restart | force-reload}"
            exit 1
            ;;
    esac
    exit 0

exit 0