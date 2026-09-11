package com.roiet.center.exception;

import java.time.Instant;
import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
 record ErrorResponse(Instant timestamp,int status,String message,Map<String,String> errors) {}
 @ExceptionHandler(NotFoundException.class) @ResponseStatus(HttpStatus.NOT_FOUND)
 ErrorResponse notFound(NotFoundException e){ return response(404,e.getMessage(),Map.of()); }
 @ExceptionHandler({BusinessException.class,IllegalArgumentException.class}) @ResponseStatus(HttpStatus.BAD_REQUEST)
 ErrorResponse business(RuntimeException e){ return response(400,e.getMessage(),Map.of()); }
 @ExceptionHandler(MethodArgumentNotValidException.class) @ResponseStatus(HttpStatus.BAD_REQUEST)
 ErrorResponse validation(MethodArgumentNotValidException e){
   Map<String,String> errors=new LinkedHashMap<>(); e.getBindingResult().getFieldErrors().forEach(x->errors.putIfAbsent(x.getField(),x.getDefaultMessage()));
   return response(400,"입력값을 확인해 주세요.",errors);
 }
 @ExceptionHandler(DataIntegrityViolationException.class) @ResponseStatus(HttpStatus.CONFLICT)
 ErrorResponse conflict(){ return response(409,"이미 존재하거나 다른 기록에서 사용 중인 데이터입니다.",Map.of()); }
 @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class) @ResponseStatus(HttpStatus.FORBIDDEN)
 ErrorResponse forbidden(){ return response(403,"이 작업을 수행할 권한이 없습니다.",Map.of()); }
 @ExceptionHandler(Exception.class) @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
 ErrorResponse unexpected(Exception e){
   org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class).error("Unexpected API failure", e);
   return response(500,"요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",Map.of());
 }
 private ErrorResponse response(int status,String message,Map<String,String> errors){ return new ErrorResponse(Instant.now(),status,message,errors); }
}
